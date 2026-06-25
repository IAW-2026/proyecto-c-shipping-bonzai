'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleDriverStatus(driverId: string) {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } })
  if (!driver) return { error: 'DRIVER_NOT_FOUND' }

  const newStatus = driver.status === 'SUSPENDED' ? 'AVAILABLE' : 'SUSPENDED'
  await prisma.driver.update({
    where: { id: driverId },
    data: { status: newStatus },
  })
  revalidatePath('/admin/gardeners')
  return { success: true }
}

export async function toggleOperatorStatus(operatorId: string) {
  const operator = await prisma.logisticOperator.findUnique({ where: { id: operatorId } })
  if (!operator) return { error: 'OPERATOR_NOT_FOUND' }

  const newStatus = operator.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE'
  await prisma.logisticOperator.update({
    where: { id: operatorId },
    data: { status: newStatus },
  })
  revalidatePath('/admin/gardeners')
  return { success: true }
}
