import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth-helpers'
import { AdminSidebar } from './components/AdminSidebar'
import { Footer } from '@/app/operator/components/Footer'

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
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        {children}
        <Footer />
      </div>
    </div>
  )
}
