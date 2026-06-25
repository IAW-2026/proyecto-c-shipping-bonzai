'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function assignDriver(shipmentId: string, driverId: string) {
  await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      driver_id: driverId,
      status: 'ASSIGNED',
    },
  })
  revalidatePath('/operator/dashboard')
}

export async function getAvailableDrivers() {
  return prisma.driver.findMany({
    where: { status: 'AVAILABLE' },
    orderBy: { created_at: 'desc' },
  })
}