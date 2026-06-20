import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyShippingServiceKey } from '@/lib/auth-verify'
import { checkRateLimit } from '@/lib/rate-limiter'
import { adminShipmentsQuerySchema } from '@/lib/validations/admin'
import type { PaginatedResponse } from '@/lib/types/api'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!verifyShippingServiceKey(request)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  if (!checkRateLimit(request)) {
    return NextResponse.json({ error: 'TOO_MANY_REQUESTS' }, { status: 429 })
  }

  const url = new URL(request.url)
  const parsed = adminShipmentsQuerySchema.safeParse(Object.fromEntries(url.searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_PARAMS', details: parsed.error.flatten() }, { status: 400 })
  }

  const { page, limit, status, seller_id, q } = parsed.data

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (seller_id) where.seller_id = seller_id

  if (q && q.length < 3) {
    return NextResponse.json({
      data: [],
      meta: { total_records: 0, current_page: page, total_pages: 0, limit },
    })
  }

  if (q && q.length >= 3) {
    where.OR = [
      { tracking_id: { contains: q, mode: 'insensitive' } },
      { delivery_address: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      include: {
        driver: true,
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
