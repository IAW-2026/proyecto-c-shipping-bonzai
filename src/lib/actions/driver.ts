'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

function getRolesFromClaims(sessionClaims: unknown): string[] {
  const claims = sessionClaims as {
    roles?: string | string[]
    publicMetadata?: { roles?: string | string[] }
  } | null
  const raw = claims?.roles || claims?.publicMetadata?.roles || []
  return Array.isArray(raw) ? raw : [raw]
}

export async function confirmPickup(shipmentId: string) {
  try {
    const { userId, sessionClaims } = await auth()

    if (!userId) {
      return { error: 'UNAUTHORIZED' }
    }

    const roles = getRolesFromClaims(sessionClaims)
    if (!roles.includes('driver_shipping')) {
      return { error: 'FORBIDDEN' }
    }

    const driver = await prisma.driver.findUnique({
      where: { clerk_user_id: userId },
    })

    if (!driver) {
      return { error: 'DRIVER_NOT_FOUND' }
    }

    if (driver.status === 'SUSPENDED' || driver.status === 'INACTIVE') {
      return { error: 'DRIVER_INACTIVE' }
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
    })

    if (!shipment) {
      return { error: 'SHIPMENT_NOT_FOUND' }
    }

    if (shipment.driver_id !== driver.id) {
      return { error: 'FORBIDDEN' }
    }

    if (shipment.status !== 'PENDING') {
      return { error: 'INVALID_STATUS' }
    }

    const [updated] = await prisma.$transaction([
      prisma.shipment.update({
        where: { id: shipmentId },
        data: { status: 'IN_TRANSIT' },
      }),
      prisma.trackingEvent.create({
        data: {
          shipment_id: shipmentId,
          status: 'EN_TRANSITO',
        },
      }),
    ])

    return { success: true, shipment: updated }
  } catch {
    return { error: 'INTERNAL_ERROR' }
  }
}

export async function confirmDelivery(shipmentId: string) {
  try {
    const { userId, sessionClaims } = await auth()

    if (!userId) {
      return { error: 'UNAUTHORIZED' }
    }

    const roles = getRolesFromClaims(sessionClaims)
    if (!roles.includes('driver_shipping')) {
      return { error: 'FORBIDDEN' }
    }

    const driver = await prisma.driver.findUnique({
      where: { clerk_user_id: userId },
    })

    if (!driver) {
      return { error: 'DRIVER_NOT_FOUND' }
    }

    if (driver.status === 'SUSPENDED' || driver.status === 'INACTIVE') {
      return { error: 'DRIVER_INACTIVE' }
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
    })

    if (!shipment) {
      return { error: 'SHIPMENT_NOT_FOUND' }
    }

    if (shipment.driver_id !== driver.id) {
      return { error: 'FORBIDDEN' }
    }

    if (shipment.status !== 'IN_TRANSIT') {
      return { error: 'INVALID_STATUS' }
    }

    const [updated] = await prisma.$transaction([
      prisma.shipment.update({
        where: { id: shipmentId },
        data: { status: 'DELIVERED', delivered_at: new Date() },
      }),
      prisma.trackingEvent.create({
        data: {
          shipment_id: shipmentId,
          status: 'ENTREGADO',
        },
      }),
    ])

    try {
      const paymentsUrl = `${process.env.PAYMENTS_API_URL}/api/payments/${shipment.transaction_id}/delivered`
      const response = await fetch(paymentsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.PAYMENTS_API_KEY || '',
        },
      })

      if (!response.ok) {
        console.error('Payments notification failed:', response.status, await response.text())
      }
    } catch (error) {
      console.error('Payments notification error:', error)
    }

    return { success: true, shipment: updated }
  } catch {
    return { error: 'INTERNAL_ERROR' }
  }
}
