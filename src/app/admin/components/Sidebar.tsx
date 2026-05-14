'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, BarChart3, Settings, User } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/shipments', label: 'Shipping', icon: Package },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-outline-ghost flex flex-col fixed h-full bg-surface-high z-20 dark:bg-dark-bg dark:border-slate-800">
      <div className="p-8">
        <h1 className="font-display text-2xl font-bold italic tracking-tight text-primary dark:text-surface-high">
          The Living Archive
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-secondary mt-1">
          Bonzai Shipping Portal
        </p>
      </div>

      <nav className="flex-1 px-6 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname === item.href || pathname?.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 transition-all group rounded-lg ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-secondary hover:text-primary dark:hover:text-surface-high'
              }`}
            >
              <Icon size={18} strokeWidth={1.5} />
              <span className="text-sm font-medium tracking-wide uppercase">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-outline-ghost dark:border-slate-800">
        <div className="mt-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-low flex items-center justify-center">
            <User size={18} className="text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold dark:text-surface-high">Curator</p>
            <p className="text-[10px] text-secondary">Master Curator</p>
          </div>
        </div>
      </div>
    </aside>
  )
}