import { FloatingDock } from './components/FloatingDock'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bone">
      <FloatingDock />
      {children}
    </div>
  )
}