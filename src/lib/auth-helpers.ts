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
export async function syncUserProfile(): Promise<void> {
  const { userId } = await auth()
  if (!userId) return
  const roles = await getUserRoles()
  if (roles.includes('logistics') || roles.includes('super_admin')) {
    const existing = await prisma.logisticOperator.findUnique({
      where: { clerk_user_id: userId }
    })
    
    if (!existing) {
      await prisma.logisticOperator.create({
        data: { clerk_user_id: userId }
      })
    }
  }
  if (roles.includes('driver')) {
    const existing = await prisma.driver.findUnique({
      where: { clerk_user_id: userId }
    })
    
    if (!existing) {
      await prisma.driver.create({
        data: { clerk_user_id: userId }
      })
    }
  }
}