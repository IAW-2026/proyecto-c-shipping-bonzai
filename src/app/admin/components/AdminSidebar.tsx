'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, LayoutDashboard, Truck } from 'lucide-react'

const navItems = [
  { href: '/admin/onboarding', label: 'Nuevos Especímenes', icon: Users },
  { href: '/operator/dashboard', label: 'Shipping Overview', icon: LayoutDashboard },
  { href: '/driver', label: 'Vista del Repartidor', icon: Truck },
]

export function AdminSidebar() {
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
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 transition-all group rounded-lg ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-secondary hover:text-primary dark:hover:text-surface-high'
              }`}
            >
              <Icon size={18} strokeWidth={1.5} />
              <span className="text-sm font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="px-4 py-2">
          <p className="font-sans text-[10px] text-secondary uppercase tracking-widest">
            Curador Principal
          </p>
        </div>
      </div>
    </aside>
  )
}
