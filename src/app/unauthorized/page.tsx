import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { Leaf, RefreshCw, ArrowRight } from 'lucide-react'
import { SignOutButton } from './components/SignOutButton'

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

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const params = await searchParams
  const reason = params.reason

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const roles = getRolesFromUser(user)
  const hasShippingRole = roles.some((r) => VALID_SHIPPING_ROLES.includes(r))

  if (hasShippingRole && reason !== 'wrong-role') {
    redirect(getDashboardUrl(roles))
  }

  const isPending = reason === 'pending' || !reason
  const dashboardUrl = getDashboardUrl(roles)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-[480px]">
        <div className="bg-white rounded-2xl p-10 shadow-sm">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-surface-low rounded-full flex items-center justify-center">
              <Leaf
                size={28}
                className="text-secondary"
                strokeWidth={1.5}
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-primary mb-4 leading-tight">
              {isPending
                ? 'Tu entrada al archivo está siendo procesada.'
                : 'Este espécimen no pertenece a esta sección del diario.'}
            </h1>
            <p className="font-sans text-sm text-secondary leading-relaxed">
              {isPending
                ? 'El Curador Principal debe asignar tu lugar en el invernadero.'
                : 'Tu rol actual no tiene permisos para acceder a este espacio.'}
            </p>
          </div>

          {isPending && (
            <div className="mb-8 p-4 bg-surface-low rounded-xl flex items-center gap-3">
              <RefreshCw size={16} className="text-secondary shrink-0" strokeWidth={1.5} />
              <p className="font-sans text-xs text-secondary">
                Si ya recibiste asignación, refresca esta página o vuelve a iniciar sesión.
              </p>
            </div>
          )}

          {!isPending && (
            <div className="mb-8 p-4 bg-surface-low rounded-xl">
              <p className="font-sans text-xs text-secondary uppercase tracking-wider mb-1">
                Rol detectado
              </p>
              <p className="font-sans text-sm text-primary">
                {roles.join(', ') || 'sin rol asignado'}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {!isPending && (
              <a
                href={dashboardUrl}
                className="flex items-center justify-center gap-2 w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-sans text-sm transition-colors"
              >
                <ArrowRight size={16} strokeWidth={1.5} />
                Ir a mi panel
              </a>
            )}
            <SignOutButton />
          </div>
        </div>

        <p className="text-center mt-8 font-sans text-xs text-secondary/60">
          Bonzai Shipping Portal — The Botanical Curator
        </p>
      </div>
    </div>
  )
}
