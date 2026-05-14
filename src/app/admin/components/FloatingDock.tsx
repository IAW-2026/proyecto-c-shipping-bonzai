'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, BarChart3, Settings } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/shipments', label: 'Shipments', icon: Package },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function FloatingDock() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 px-2 py-2 rounded-2xl backdrop-blur-[20px] bg-bone/85 shadow-[0_8px_32px_rgba(27,28,25,0.04)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-evergreen text-white'
                  : 'text-moss hover:bg-surface-container'
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              <span className="font-sans text-[10px] uppercase tracking-[0.15em] font-medium hidden sm:inline">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}