'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart3, Settings, Shield } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

const navItems = [
  { href: '/operator/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/operator/analytics', label: 'Analíticas', icon: BarChart3 },
  { href: '/operator/settings', label: 'Configuración', icon: Settings },
]

export function Sidebar({ mobile, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()
  const { user } = useUser()
  const roles = (user?.publicMetadata?.roles as string[]) || []
  const isAdmin = roles.includes('shipping_admin')

  const handleClick = () => {
    if (mobile && onNavigate) onNavigate()
  }

  return (
    <aside className={`w-64 border-r border-outline-ghost flex flex-col h-full bg-surface-high z-20 dark:bg-dark-bg dark:border-slate-800 ${mobile ? '' : 'fixed'}`}>
      <div className="p-8">
        <h1 className="font-display text-2xl font-bold italic tracking-tight text-primary dark:text-surface-high">
          The Living Archive
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-secondary mt-1">
          Portal de Envíos Bonzai
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
              onClick={handleClick}
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

        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-outline-ghost dark:border-slate-800">
            <Link
              href="/admin/onboarding"
              onClick={handleClick}
              className="flex items-center gap-3 px-4 py-3 transition-all group rounded-lg text-secondary hover:text-primary"
            >
              <Shield size={18} strokeWidth={1.5} />
              <span className="text-sm font-medium tracking-wide">
                Panel de Administración
              </span>
            </Link>
          </div>
        )}
      </nav>

    </aside>
  )
}