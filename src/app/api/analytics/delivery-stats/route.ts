import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyShippingServiceKey } from '@/lib/auth-verify'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!verifyShippingServiceKey(request)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const [total, pending, assigned, inTransit, delivered, cancelled] = await Promise.all([
      prisma.shipment.count(),
      prisma.shipment.count({ where: { status: 'PENDING' } }),
      prisma.shipment.count({ where: { status: 'ASSIGNED' } }),
      prisma.shipment.count({ where: { status: 'IN_TRANSIT' } }),
      prisma.shipment.count({ where: { status: 'DELIVERED' } }),
      prisma.shipment.count({ where: { status: 'CANCELLED' } }),
    ])

    const activeShipments = pending + assigned + inTransit
    const successRatePercentage = total > 0 ? Math.round((delivered / total) * 100) : 0

    return NextResponse.json({
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
    })
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
