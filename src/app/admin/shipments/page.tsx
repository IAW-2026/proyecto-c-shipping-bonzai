import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { SearchFilterBar } from '../components/SearchFilterBar'
import { CuratedCard } from '../components/CuratedCard'
import { EmptyState } from '../components/EmptyState'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/')

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
    return `/admin/shipments?${sp.toString()}`
  }

  return (
    <main className="min-h-screen bg-bone pt-24 pb-32 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16">
          <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-moss">
            Logistics & Operations
          </span>
          <h1 className="font-display text-5xl md:text-6xl mt-3 text-evergreen">
            Shipping Overview
          </h1>
        </header>

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
            <p className="font-sans text-xs text-moss">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <a
                href={hasPrev ? buildPageUrl(page - 1) : '#'}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  hasPrev
                    ? 'bg-surface-low text-evergreen hover:bg-surface-container'
                    : 'bg-surface-low/50 text-moss/30 cursor-not-allowed'
                }`}
              >
                <ChevronLeft size={18} strokeWidth={1.5} />
              </a>
              <a
                href={hasNext ? buildPageUrl(page + 1) : '#'}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  hasNext
                    ? 'bg-surface-low text-evergreen hover:bg-surface-container'
                    : 'bg-surface-low/50 text-moss/30 cursor-not-allowed'
                }`}
              >
                <ChevronRight size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}