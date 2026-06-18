import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyShippingServiceKey } from '@/lib/auth-verify'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!verifyShippingServiceKey(request)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const events = await prisma.trackingEvent.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
      include: {
        shipment: { select: { tracking_id: true } },
      },
    })

    const data = events.map((event) => ({
      id: event.id,
      tracking_id: event.shipment.tracking_id,
      status: event.status,
      timestamp: event.timestamp.toISOString(),
    }))

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
