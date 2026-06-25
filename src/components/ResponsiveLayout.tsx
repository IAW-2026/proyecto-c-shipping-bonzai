'use client'

import { useState, type ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { Footer } from '@/app/operator/components/Footer'

export function ResponsiveLayout({
  title,
  sidebar: SidebarComponent,
  children,
}: {
  title: string
  sidebar: React.ComponentType<{ mobile?: boolean; onNavigate?: () => void }>
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  const handleClose = () => setOpen(false)

  return (
    <div className="min-h-dvh bg-background flex">
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-primary/30 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="absolute left-0 top-0 h-full">
            <SidebarComponent mobile onNavigate={handleClose} />
          </div>
        </div>
      )}

      <aside className="hidden lg:flex">
        <SidebarComponent />
      </aside>

      <div className="flex-1 lg:ml-64">
        <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-surface-high border-b border-outline-ghost flex items-center px-4 z-30">
          <button onClick={() => setOpen(true)} className="p-1 -ml-1">
            <Menu size={20} className="text-primary" strokeWidth={1.5} />
          </button>
          <span className="ml-3 font-display text-lg text-primary truncate">{title}</span>
        </div>

        <div className="pt-14 lg:pt-0">
          {children}
          <Footer />
        </div>
      </div>
    </div>
  )
}
