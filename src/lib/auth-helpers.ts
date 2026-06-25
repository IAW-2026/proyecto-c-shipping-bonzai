import { auth } from "@clerk/nextjs/server"
import { prisma } from "./prisma"

export async function getUserRoles(): Promise<string[]> {
  const { sessionClaims } = await auth()
  const claims = sessionClaims as {
    roles?: string | string[]
    publicMetadata?: { roles?: string | string[] }
  } | null

  const roles = claims?.roles || claims?.publicMetadata?.roles || []
  return Array.isArray(roles) ? roles : [roles as string]
}

export async function isAdmin(): Promise<boolean> {
  const roles = await getUserRoles()
  return roles.includes('shipping_admin')
}

export type UserState =
  | 'AUTHENTICATED_NO_ROLE'
  | 'AUTHENTICATED_WRONG_ROLE'
  | 'OPERATOR_ACTIVE'
  | 'DRIVER_ACTIVE'
  | 'ADMIN_ACTIVE'

const VALID_SHIPPING_ROLES = ['operator_shipping', 'driver_shipping', 'shipping_admin']

export async function getUserState(): Promise<UserState | null> {
  const { userId } = await auth()
  if (!userId) return null

  const roles = await getUserRoles()

  if (!roles.length) return 'AUTHENTICATED_NO_ROLE'

  const hasShippingRole = roles.some((r) => VALID_SHIPPING_ROLES.includes(r))
  if (!hasShippingRole) return 'AUTHENTICATED_WRONG_ROLE'

  if (roles.includes('shipping_admin')) return 'ADMIN_ACTIVE'
  if (roles.includes('operator_shipping')) return 'OPERATOR_ACTIVE'
  if (roles.includes('driver_shipping')) return 'DRIVER_ACTIVE'

  return 'AUTHENTICATED_WRONG_ROLE'
}

import type { LogisticOperator, Driver } from '@prisma/client'

export async function getLocalProfile(): Promise<{
  type: 'operator' | 'driver'
  profile: LogisticOperator | Driver
  isActive: boolean
} | null> {
  const { userId } = await auth()
  if (!userId) return null

  const roles = await getUserRoles()

  if (roles.includes('operator_shipping')) {
    let operator = await prisma.logisticOperator.findUnique({
      where: { clerk_user_id: userId }
    })
    if (!operator) {
      operator = await prisma.logisticOperator.create({
        data: { clerk_user_id: userId, status: 'ACTIVE' }
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
        data: { clerk_user_id: userId, status: 'AVAILABLE' }
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
  const result = await getLocalProfile()
  if (!result || !result.isActive) {
    return null
  }
  return result
}