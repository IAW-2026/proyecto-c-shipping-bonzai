import { Sidebar } from './components/Sidebar'
import { ResponsiveLayout } from '@/components/ResponsiveLayout'

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ResponsiveLayout title="Portal de Envíos Bonzai" sidebar={Sidebar}>
      {children}
    </ResponsiveLayout>
  )
}
