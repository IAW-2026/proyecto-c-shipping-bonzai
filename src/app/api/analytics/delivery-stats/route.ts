import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyShippingServiceKey } from '@/lib/auth-verify'
import { checkRateLimit } from '@/lib/rate-limiter'
import { analyticsDateFilterSchema } from '@/lib/validations/admin'

export const dynamic = 'force-dynamic'

function applyDateFilter(
  where: Record<string, unknown>,
  from?: string,
  to?: string
): void {
  if (!from && !to) return
  const dateFilter: Record<string, Date> = {}
  if (from) dateFilter.gte = new Date(from)
  if (to) dateFilter.lte = new Date(to)
  where.created_at = dateFilter
}

export async function GET(request: Request) {
  if (!verifyShippingServiceKey(request)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  if (!checkRateLimit(request)) {
    return NextResponse.json({ error: 'TOO_MANY_REQUESTS' }, { status: 429 })
  }

  const url = new URL(request.url)
  const parsed = analyticsDateFilterSchema.safeParse(Object.fromEntries(url.searchParams))
  const filter = parsed.success ? parsed.data : {}

  try {
    const where: Record<string, unknown> = {}
    if (filter.from || filter.to) {
      applyDateFilter(where, filter.from, filter.to)
    }

    const [total, pending, assigned, inTransit, delivered, cancelled] = await Promise.all([
      prisma.shipment.count({ where }),
      prisma.shipment.count({ where: { ...where, status: 'PENDING' } }),
      prisma.shipment.count({ where: { ...where, status: 'ASSIGNED' } }),
      prisma.shipment.count({ where: { ...where, status: 'IN_TRANSIT' } }),
      prisma.shipment.count({ where: { ...where, status: 'DELIVERED' } }),
      prisma.shipment.count({ where: { ...where, status: 'CANCELLED' } }),
    ])

    const activeShipments = pending + assigned + inTransit
    const successRatePercentage = total > 0 ? Math.round((delivered / total) * 100) : 0

    const response: Record<string, unknown> = {
      total_shipments: total,
      active_shipments: activeShipments,
      success_rate_percentage: successRatePercentage,
      by_status: {
        PENDING: pending,
        ASSIGNED: assigned,
        IN_TRANSIT: inTransit,
        DELIVERED: delivered,
        CANCELLED: cancelled,
      },
    }

    if (filter.granularity) {
      const sqlFrom = filter.from || '1970-01-01T00:00:00.000Z'
      const sqlTo = filter.to || '2099-12-31T23:59:59.000Z'
      const rows = await prisma.$queryRawUnsafe(
        `SELECT DATE_TRUNC('${filter.granularity}', created_at)::text AS period, status, COUNT(*)::int AS count FROM "Shipment" WHERE created_at >= '${sqlFrom}'::timestamp AND created_at <= '${sqlTo}'::timestamp GROUP BY period, status ORDER BY period`
      ) as { period: string; status: string; count: number }[]

      const periodsMap = new Map<string, Record<string, number>>()
      for (const row of rows) {
        if (!periodsMap.has(row.period)) {
          periodsMap.set(row.period, {})
        }
        periodsMap.get(row.period)![row.status] = row.count
      }

      response.periods = Array.from(periodsMap.entries()).map(([period, statuses]) => ({
        period,
        ...statuses,
      }))
    }

    return NextResponse.json(response)
  } catch {
    return NextResponse.json({
      total_shipments: 0,
      active_shipments: 0,
      success_rate_percentage: 0,
      by_status: { PENDING: 0, ASSIGNED: 0, IN_TRANSIT: 0, DELIVERED: 0, CANCELLED: 0 },
    })
  }
}
