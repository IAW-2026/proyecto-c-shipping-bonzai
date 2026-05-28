import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getPoeticMessage } from '@/lib/tracking-messages'
import { NextResponse } from 'next/server'

const ADMIN_ROLES = ['shipping_admin', 'operator_shipping']

function getRolesFromClaims(sessionClaims: unknown): string[] {
  const claims = sessionClaims as {
    roles?: string | string[]
    publicMetadata?: { roles?: string | string[] }
  } | null
  const raw = claims?.roles || claims?.publicMetadata?.roles || []
  return Array.isArray(raw) ? raw : [raw]
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { userId, sessionClaims } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { trackingId } = await params

    if (!trackingId || trackingId.trim() === '') {
      return NextResponse.json({ error: 'INVALID_TRACKING_ID' }, { status: 400 })
    }

    const shipment = await prisma.shipment.findUnique({
      where: { tracking_id: trackingId },
      include: {
        tracking_events: {
          orderBy: { timestamp: 'desc' },
        },
      },
    })

    if (!shipment) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
    }

    const roles = getRolesFromClaims(sessionClaims)
    const isAdminOrOperator = roles.some((r) => ADMIN_ROLES.includes(r))

    if (!isAdminOrOperator && shipment.buyer_id !== userId) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }

    const response = {
      trackingId: shipment.tracking_id,
      status: shipment.status,
      type: shipment.type,
      deliveryAddress: shipment.delivery_address,
      createdAt: shipment.created_at,
      updatedAt: shipment.updated_at,
      events: shipment.tracking_events.map((event) => ({
        status: event.status,
        timestamp: event.timestamp,
        poeticMessage: getPoeticMessage(event.status),
      })),
    }

    return NextResponse.json(response, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
