import { Sidebar } from './components/Sidebar'
import { Footer } from './components/Footer'

export default function OperatorLayout({
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
    </div>
  )
}