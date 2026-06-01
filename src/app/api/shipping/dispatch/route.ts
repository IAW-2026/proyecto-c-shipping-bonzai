import { verifyRequestAuth } from '@/lib/auth-verify'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { NextResponse } from 'next/server'

const clerkIdRegex = /^user_[a-zA-Z0-9]+$/

const dispatchSchema = z.object({
  orderRef: z.string().min(1),
  transactionId: z.string().min(1),
  sellerId: z.string().regex(clerkIdRegex),
  buyerId: z.string().regex(clerkIdRegex),
  deliveryAddress: z.string().min(1),
  type: z.enum(['PLANTA_VIVA', 'INSUMOS', 'FRAGIL', 'SEMILLAS', 'OTROS']),
})

function generateTrackingId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'BOT-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: Request) {
  try {
    const { userId } = await verifyRequestAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const body = await request.json()
    const validated = dispatchSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { error: 'INVALID_DATA', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { orderRef, transactionId, sellerId, buyerId, deliveryAddress, type } = validated.data

    if (sellerId !== userId) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }

    const existing = await prisma.shipment.findFirst({
      where: { order_id: orderRef, seller_id: sellerId },
    })

    if (existing) {
      if (existing.delivery_address !== deliveryAddress || existing.type !== type) {
        return NextResponse.json(
          { error: 'CONFLICT', message: 'Shipment exists with different data' },
          { status: 409 }
        )
      }

      try {
        const sellerUrl = `${process.env.SELLER_SERVICE_URL}/api/orders/${orderRef}/tracking`
        const sellerRes = await fetch(sellerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-service-key': process.env.SELLER_SERVICE_KEY || '',
          },
          body: JSON.stringify({ trackingId: existing.tracking_id }),
        })
        if (!sellerRes.ok) {
          console.error(`Seller notification failed: ${sellerRes.status} ${sellerRes.statusText}`)
        } else {
          console.log(`Seller notification success: ${sellerRes.status}`)
        }
      } catch (error) {
        console.error('Seller notification error:', error)
      }

      return NextResponse.json(
        { trackingId: existing.tracking_id, status: 'ALREADY_EXISTS' },
        { status: 200 }
      )
    }

    let attempts = 0
    let shipment = null

    while (attempts < 3 && !shipment) {
      try {
        const trackingId = generateTrackingId()
        shipment = await prisma.shipment.create({
          data: {
            tracking_id: trackingId,
            order_id: orderRef,
            transaction_id: transactionId,
            seller_id: sellerId,
            buyer_id: buyerId,
            delivery_address: deliveryAddress,
            type,
            status: 'PENDING',
          },
        })
      } catch (e) {
        const isUniqueViolation =
          typeof e === 'object' &&
          e !== null &&
          'code' in e &&
          e.code === 'P2002'

        if (!isUniqueViolation || attempts >= 3) {
          throw e
        }
        attempts++
      }
    }

    if (!shipment) {
      return NextResponse.json(
        { error: 'TRACKING_GENERATION_FAILED' },
        { status: 500 }
      )
    }

    await prisma.trackingEvent.create({
      data: {
        shipment_id: shipment.id,
        status: 'RECIBIDO_EN_ORIGEN',
      },
    })

    try {
      const sellerUrl = `${process.env.SELLER_SERVICE_URL}/api/orders/${orderRef}/tracking`
      const sellerRes = await fetch(sellerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-service-key': process.env.SELLER_SERVICE_KEY || '',
        },
        body: JSON.stringify({ trackingId: shipment.tracking_id }),
      })
      if (!sellerRes.ok) {
        console.error(`Seller notification failed: ${sellerRes.status} ${sellerRes.statusText}`)
      } else {
        console.log(`Seller notification success: ${sellerRes.status}`)
      }
    } catch (error) {
      console.error('Seller notification error:', error)
    }

    return NextResponse.json(
      { trackingId: shipment.tracking_id, status: 'CREATED' },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}