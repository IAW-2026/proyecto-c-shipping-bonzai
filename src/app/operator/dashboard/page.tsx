import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getLocalProfile, isAdmin } from '@/lib/auth-helpers'
import { SearchFilterBar } from '../components/SearchFilterBar'
import { CuratedCard } from '../components/CuratedCard'
import { EmptyState } from '../components/EmptyState'
import { StatsOverview } from '../components/StatsOverview'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
  const profile = await getLocalProfile()
  const admin = await isAdmin()
  if (!admin && (!profile || !profile.isActive)) {
    redirect('/unauthorized?reason=pending')
  }

  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.search || ''
  const statusFilter = params.status || 'ALL'

  const where: Record<string, unknown> = {}

  if (search) {
    where.tracking_id = { contains: search, mode: 'insensitive' }
  }

  if (statusFilter !== 'ALL') {
    where.status = statusFilter
  }

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      include: {
        driver: true,
        operator: true,
        tracking_events: {
          orderBy: { timestamp: 'asc' },
        },
      },
      skip: (page - 1) * 10,
      take: 10,
      orderBy: { created_at: 'desc' },
    }),
    prisma.shipment.count({ where }),
  ])

  const totalPages = Math.ceil(total / 10)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  const buildPageUrl = (p: number) => {
    const sp = new URLSearchParams()
    if (search) sp.set('search', search)
    if (statusFilter !== 'ALL') sp.set('status', statusFilter)
    sp.set('page', String(p))
    return `/operator/dashboard?${sp.toString()}`
  }

  return (
    <main className="min-h-screen p-6 lg:p-12 pb-20 lg:pb-32">
      <header className="flex justify-between items-center mb-12">
        <div>
          <span className="font-sans text-[11px] uppercase tracking-widest text-secondary">
            Gestion Logística
          </span>
          <h1 className="font-display text-5xl md:text-6xl mt-2 !text-[#03271a]">
            Resumen de Envíos
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-surface-high border border-outline-ghost px-4 py-2 rounded-full shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold tracking-wide uppercase text-primary">
              Bonzai Status: Activo
            </span>
          </div>
        </div>
      </header>

      <StatsOverview />

      <SearchFilterBar />

      {shipments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4 md:space-y-6">
          {shipments.map((shipment) => (
            <CuratedCard key={shipment.id} shipment={shipment} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-12 pt-8">
          <p className="font-sans text-xs text-secondary">
            Página {page} de {totalPages}
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
      )}
    </main>
  )
}