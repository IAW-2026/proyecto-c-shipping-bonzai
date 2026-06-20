import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyShippingServiceKey } from '@/lib/auth-verify'
import { checkRateLimit } from '@/lib/rate-limiter'
import { adminPaginationSchema, uuidParamSchema } from '@/lib/validations/admin'
import type { PaginatedResponse } from '@/lib/types/api'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyShippingServiceKey(request)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  if (!checkRateLimit(request)) {
    return NextResponse.json({ error: 'TOO_MANY_REQUESTS' }, { status: 429 })
  }

  const { id } = await params
  const parsedId = uuidParamSchema.safeParse(id)
  if (!parsedId.success) {
    return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })
  }

  const url = new URL(request.url)
  const parsed = adminPaginationSchema.safeParse(Object.fromEntries(url.searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_PARAMS', details: parsed.error.flatten() }, { status: 400 })
  }

  const { page, limit } = parsed.data

  const where = { driver_id: id }

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      include: {
        operator: true,
        tracking_events: { orderBy: { timestamp: 'desc' }, take: 1 },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
    }),
    prisma.shipment.count({ where }),
  ])

  const response: PaginatedResponse<typeof shipments[number]> = {
    data: shipments,
    meta: {
      total_records: total,
      current_page: page,
      total_pages: Math.ceil(total / limit),
      limit,
    },
  }

  return NextResponse.json(response)
}
