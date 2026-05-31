import { verifyRequestAuth } from '@/lib/auth-verify'
import { prisma } from '@/lib/prisma'
import { getPoeticMessage } from '@/lib/tracking-messages'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { userId } = await verifyRequestAuth(request)

    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const shipments = await prisma.shipment.findMany({
      where: {
        OR: [{ buyer_id: userId }, { seller_id: userId }],
      },
      orderBy: { created_at: 'desc' },
      include: {
        tracking_events: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    })

    const response = shipments.map((shipment) => ({
      trackingId: shipment.tracking_id,
      status: shipment.status,
      type: shipment.type,
      deliveryAddress: shipment.delivery_address,
      createdAt: shipment.created_at,
      updatedAt: shipment.updated_at,
      lastEvent: shipment.tracking_events[0]
        ? {
            status: shipment.tracking_events[0].status,
            timestamp: shipment.tracking_events[0].timestamp,
            poeticMessage: getPoeticMessage(shipment.tracking_events[0].status),
          }
        : null,
    }))

    return NextResponse.json(response, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
