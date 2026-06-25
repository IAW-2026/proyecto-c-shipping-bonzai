import { redirect } from 'next/navigation'
import { getUserRoles } from '@/lib/auth-helpers'

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const roles = await getUserRoles()
  const hasAccess = roles.includes('driver_shipping') || roles.includes('shipping_admin')
  if (!hasAccess) {
    redirect('/unauthorized?reason=wrong-role')
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
