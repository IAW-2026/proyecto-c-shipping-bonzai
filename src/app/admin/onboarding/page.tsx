import { clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth-helpers'
import { assignShippingRole } from '@/lib/actions/onboarding'
import { ChevronLeft, ChevronRight, Sprout } from 'lucide-react'

const VALID_SHIPPING_ROLES = ['operator_shipping', 'driver_shipping', 'shipping_admin']
const PAGE_SIZE = 10

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const admin = await isAdmin()
  if (!admin) {
    redirect('/unauthorized?reason=wrong-role')
  }

  const params = await searchParams
  const page = Number(params.page) || 1
  const offset = (page - 1) * PAGE_SIZE

  const client = await clerkClient()
  const userList = await client.users.getUserList({
    limit: PAGE_SIZE,
    offset,
    orderBy: '-created_at',
  })

  const pendingUsers = userList.data.filter((user) => {
    const roles = (user.publicMetadata?.roles as string[]) || []
    return !roles.some((r) => VALID_SHIPPING_ROLES.includes(r))
  })

  const totalCount = userList.totalCount
  const hasNext = offset + PAGE_SIZE < totalCount
  const hasPrev = page > 1

  const buildPageUrl = (p: number) => {
    return `/admin/onboarding?page=${p}`
  }

  return (
    <main className="p-6 lg:p-12 pb-20 lg:pb-32">
      <header className="mb-12">
        <span className="font-sans text-[11px] uppercase tracking-widest text-secondary">
          Gestión de Personal
        </span>
        <h1 className="font-display text-5xl md:text-6xl mt-2 text-primary">
          Nuevos Especímenes
        </h1>
        <p className="font-sans text-sm text-secondary mt-3">
          Usuarios autenticados esperando ser curados y asignados a su lugar en el invernadero.
        </p>
      </header>

      {pendingUsers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="flex justify-center mb-6">
            <Sprout size={40} className="text-secondary/40" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-2xl text-primary mb-2">
            El invernadero está en calma.
          </h2>
          <p className="font-sans text-sm text-secondary">
            No hay nuevos especímenes por catalogar en este momento.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl p-6 hover:bg-surface-container transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg text-primary truncate">
                    {user.firstName || ''} {user.lastName || ''}
                    {!user.firstName && !user.lastName && 'Sin nombre'}
                  </h3>
                  <p className="font-sans text-sm text-secondary mt-1">
                    {user.primaryEmailAddress?.emailAddress || 'Sin email'}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="font-sans text-xs text-secondary/60">
                      ID: {user.id.slice(0, 12)}...
                    </span>
                    <span className="font-sans text-xs text-secondary/60">
                      {new Date(user.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <form
                  action={assignShippingRole}
                  className="flex items-center gap-3"
                >
                  <input type="hidden" name="userId" value={user.id} />
                  <select
                    name="role"
                    required
                    className="h-10 px-3 bg-surface-low rounded-xl font-sans text-sm text-primary border-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Seleccionar rol...</option>
                    <option value="operator_shipping">Operador Logístico</option>
                    <option value="driver_shipping">Conductor</option>
                  </select>
                  <button
                    type="submit"
                    className="h-10 px-5 bg-primary hover:bg-primary/90 text-white rounded-xl font-sans text-sm transition-colors whitespace-nowrap"
                  >
                    Asignar al Invernadero
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-12 pt-8">
        <p className="font-sans text-xs text-secondary">
          Página {page}
        </p>
        <div className="flex items-center gap-2">
          <a
            href={hasPrev ? buildPageUrl(page - 1) : '#'}
            className={`p-3 rounded-xl transition-all duration-300 ${
              hasPrev
                ? 'bg-surface-low text-primary hover:bg-surface-container'
                : 'bg-surface-low/50 text-secondary/30 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </a>
          <a
            href={hasNext ? buildPageUrl(page + 1) : '#'}
            className={`p-3 rounded-xl transition-all duration-300 ${
              hasNext
                ? 'bg-surface-low text-primary hover:bg-surface-container'
                : 'bg-surface-low/50 text-secondary/30 cursor-not-allowed'
            }`}
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </main>
  )
}
