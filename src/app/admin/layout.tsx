import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth-helpers'
import { AdminSidebar } from './components/AdminSidebar'
import { ResponsiveLayout } from '@/components/ResponsiveLayout'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await isAdmin()
  if (!admin) {
    redirect('/unauthorized?reason=wrong-role')
  }

  return (
    <ResponsiveLayout title="Curador Principal" sidebar={AdminSidebar}>
      {children}
    </ResponsiveLayout>
  )
}
