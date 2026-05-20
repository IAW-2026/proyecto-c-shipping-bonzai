'use server'

import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const assignRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['operator_shipping', 'driver_shipping']),
})

export async function assignShippingRole(formData: FormData): Promise<void> {
  const { userId: executorId, sessionClaims } = await auth()
  if (!executorId) {
    throw new Error('No autenticado')
  }

  const claims = sessionClaims as {
    roles?: string | string[]
    publicMetadata?: { roles?: string | string[] }
  } | null
  const executorRoles = Array.isArray(claims?.roles)
    ? claims.roles
    : claims?.roles
      ? [claims.roles]
      : []
  if (!executorRoles.includes('shipping_admin')) {
    throw new Error('No autorizado. Se requiere rol de administrador.')
  }

  const rawUserId = formData.get('userId')
  const rawRole = formData.get('role')
  const parsed = assignRoleSchema.safeParse({
    userId: rawUserId,
    role: rawRole,
  })
  if (!parsed.success) {
    throw new Error('Datos inválidos')
  }

  const { userId, role } = parsed.data

  const client = await clerkClient()
  await client.users.updateUser(userId, {
    publicMetadata: { roles: [role] },
  })

  if (role === 'operator_shipping') {
    await prisma.logisticOperator.create({
      data: {
        clerk_user_id: userId,
        status: 'ACTIVE',
      },
    })
  } else if (role === 'driver_shipping') {
    await prisma.driver.create({
      data: {
        clerk_user_id: userId,
        status: 'AVAILABLE',
      },
    })
  }

  revalidatePath('/admin/onboarding')
  redirect('/admin/onboarding')
}
