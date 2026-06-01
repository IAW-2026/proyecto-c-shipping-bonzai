import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getLocalProfile, isAdmin } from '@/lib/auth-helpers'
import { AnalyticsCharts } from './components/AnalyticsCharts'

export default async function AnalyticsPage() {
  const profile = await getLocalProfile()
  const admin = await isAdmin()
  if (!admin && (!profile || !profile.isActive)) {
    redirect('/unauthorized?reason=pending')
  }

  const [byStatus, byType, topDriversData, total, delivered] = await Promise.all([
    prisma.shipment.groupBy({ by: ['status'], _count: true }),
    prisma.shipment.groupBy({ by: ['type'], _count: true }),
    prisma.shipment.groupBy({
      by: ['driver_id'],
      _count: true,
    }),
    prisma.shipment.count(),
    prisma.shipment.count({ where: { status: 'DELIVERED' } }),
  ])

  const driverIds = topDriversData.filter((d) => d.driver_id).map((d) => d.driver_id!)
  const drivers = await prisma.driver.findMany({
    where: { id: { in: driverIds } },
    select: { id: true, clerk_user_id: true },
  })

  const driverMap = new Map(drivers.map((d) => [d.id, d.clerk_user_id.slice(0, 12) + '...']))

  const topDrivers = topDriversData
    .filter((d) => d.driver_id)
    .map((d) => ({
      name: driverMap.get(d.driver_id!) || 'Desconocido',
      count: d._count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const statusData = byStatus.map((s) => ({
    name: s.status.replace('_', ' '),
    count: s._count,
  }))

  const typeData = byType.map((t) => ({
    name: t.type.replace('_', ' '),
    count: t._count,
  }))

  const order = ['PENDING', 'ASSIGNED', 'IN TRANSIT', 'DELIVERED', 'CANCELLED']
  statusData.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))

  return (
    <main className="p-12 pb-32">
      <header className="mb-12">
        <span className="font-sans text-[11px] uppercase tracking-widest text-secondary">
          Analíticas
        </span>
        <h1 className="font-display text-5xl md:text-6xl mt-2 text-primary">
          Analíticas de Envíos
        </h1>
        <p className="font-sans text-sm text-secondary mt-3">
          Métricas de rendimiento e información de envíos.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-high rounded-xl border border-outline-ghost p-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-secondary mb-1">
            Total de Envíos
          </p>
          <p className="font-display text-4xl text-primary">{total}</p>
        </div>
        <div className="bg-surface-high rounded-xl border border-outline-ghost p-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-secondary mb-1">
            Entregados
          </p>
          <p className="font-display text-4xl text-primary">{delivered}</p>
        </div>
        <div className="bg-surface-high rounded-xl border border-outline-ghost p-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-secondary mb-1">
            Tasa de Éxito
          </p>
          <p className="font-display text-4xl text-primary">
            {total > 0 ? Math.round((delivered / total) * 100) : 0}%
          </p>
        </div>
      </div>

      <AnalyticsCharts
        statusData={statusData}
        typeData={typeData}
        topDrivers={topDrivers}
      />
    </main>
  )
}
