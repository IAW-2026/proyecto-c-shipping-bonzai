import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyShippingServiceKey } from '@/lib/auth-verify'
import { adminShipmentsQuerySchema } from '@/lib/validations/admin'
import type { PaginatedResponse } from '@/lib/types/api'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!verifyShippingServiceKey(request)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const url = new URL(request.url)
  const parsed = adminShipmentsQuerySchema.safeParse(Object.fromEntries(url.searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_PARAMS', details: parsed.error.flatten() }, { status: 400 })
  }

  const { page, limit, seller_id } = parsed.data

  const where: Record<string, unknown> = { status: 'CANCELLED' }
  if (seller_id) where.seller_id = seller_id

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
