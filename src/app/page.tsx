import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { Leaf, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const VALID_SHIPPING_ROLES = ['operator_shipping', 'driver_shipping', 'shipping_admin']

function getRolesFromUser(user: { publicMetadata?: Record<string, unknown> }): string[] {
  const raw = user.publicMetadata?.roles
  if (Array.isArray(raw)) return raw as string[]
  if (typeof raw === 'string') return [raw]
  return []
}

function getDashboardUrl(roles: string[]): string {
  if (roles.includes('shipping_admin')) return '/admin/onboarding'
  if (roles.includes('operator_shipping')) return '/operator/dashboard'
  if (roles.includes('driver_shipping')) return '/driver'
  return '/'
}

export default async function HomePage() {
  const { userId } = await auth()

  let isAuthenticated = false
  let hasRole = false
  let dashboardUrl = '/operator/dashboard'

  if (userId) {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const roles = getRolesFromUser(user)
    hasRole = roles.some((r) => VALID_SHIPPING_ROLES.includes(r))
    isAuthenticated = true
    if (hasRole) {
      dashboardUrl = getDashboardUrl(roles)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <Leaf size={48} className="text-primary mx-auto mb-4" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-6xl text-primary mb-4">
          The Living Archive
        </h1>
        <p className="font-sans text-lg text-secondary mb-2">
          Portal de Envíos Bonzai
        </p>
        <p className="font-sans text-sm text-secondary/70 mb-12 max-w-md mx-auto">
          Gestion del ciclo de vida de los envíos botánicos. Desde plantas vivas
          hasta insumos especializados, cada especimen es un registro curado en tránsito.
        </p>
        {isAuthenticated && hasRole ? (
          <div className="flex flex-col items-center gap-3">
            <a
              href={dashboardUrl}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl text-sm uppercase tracking-[0.1em] font-sans font-medium hover:bg-primary/90 transition-all"
            >
              <ArrowRight size={16} strokeWidth={1.5} />
              Ir al Panel
            </a>
            <a
              href="/shipping"
              className="inline-flex items-center gap-2 px-6 py-3 bg-surface-high text-primary rounded-xl text-sm font-sans font-medium hover:bg-surface-container transition-all"
            >
              Mis Envíos
            </a>
          </div>
        ) : isAuthenticated ? (
          <div className="flex flex-col items-center gap-3">
            <a
              href="/shipping"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl text-sm uppercase tracking-[0.1em] font-sans font-medium hover:bg-primary/90 transition-all"
            >
              <ArrowRight size={16} strokeWidth={1.5} />
              Mis Envíos
            </a>
          </div>
        ) : (
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl text-sm uppercase tracking-[0.1em] font-sans font-medium hover:bg-primary/90 transition-all"
          >
            Entrar al Archivo
          </Link>
        )}
      </div>
    </div>
  )
}
