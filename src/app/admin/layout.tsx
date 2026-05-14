import { Sidebar } from './components/Sidebar'
import { Footer } from './components/Footer'
import { ThemeToggle } from './components/ThemeToggle'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        {children}
        <Footer />
      </div>
      <ThemeToggle />
    </div>
  )
}