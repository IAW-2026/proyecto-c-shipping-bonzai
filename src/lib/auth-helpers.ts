import { auth } from "@clerk/nextjs/server"
import { prisma } from "./prisma"

export async function getUserRoles(): Promise<string[]> {
  const { sessionClaims } = await auth()
  const claims = sessionClaims as { 
    roles?: string | string[]; 
    publicMetadata?: { roles?: string | string[] } 
  } | null

  const roles = claims?.roles || claims?.publicMetadata?.roles || []
  return Array.isArray(roles) ? roles : [roles as string]
}

import type { LogisticOperator, Driver } from '@prisma/client'

export async function getOrCreateProfile(): Promise<{
  type: 'operator' | 'driver'
  profile: LogisticOperator | Driver
  isActive: boolean
} | null> {
  const { userId } = await auth()
  if (!userId) return null

  const roles = await getUserRoles()

  if (!roles.length) return null

  if (roles.includes('operator_shipping')) {
    let operator = await prisma.logisticOperator.findUnique({
      where: { clerk_user_id: userId }
    })

    if (!operator) {
      operator = await prisma.logisticOperator.create({
        data: { clerk_user_id: userId }
      })
    }

    return {
      type: 'operator',
      profile: operator,
      isActive: operator.status === 'ACTIVE'
    }
  }

  if (roles.includes('driver_shipping')) {
    let driver = await prisma.driver.findUnique({
      where: { clerk_user_id: userId }
    })

    if (!driver) {
      driver = await prisma.driver.create({
        data: { clerk_user_id: userId }
      })
    }

    return {
      type: 'driver',
      profile: driver,
      isActive: driver.status !== 'SUSPENDED' && driver.status !== 'INACTIVE'
    }
  }

  return null
}

export async function getAuthenticatedProfile() {
  const result = await getOrCreateProfile()
  if (!result || !result.isActive) {
    return null
  }
  return result
}