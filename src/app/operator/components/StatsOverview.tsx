import { prisma } from '@/lib/prisma'
import { Package, Truck, CheckCircle } from 'lucide-react'

export async function StatsOverview() {
  const [pending, inTransit, delivered] = await Promise.all([
    prisma.shipment.count({ where: { status: 'PENDING' } }),
    prisma.shipment.count({ where: { status: 'IN_TRANSIT' } }),
    prisma.shipment.count({ where: { status: 'DELIVERED' } }),
  ])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <div className="bg-surface-high p-8 rounded-xl border border-outline-ghost shadow-sm relative overflow-hidden group">
        <div className="relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-secondary mb-4">
            Envíos Pendientes
          </p>
          <h3 className="font-display text-5xl font-light mb-2 text-primary">
            {pending}
          </h3>
          <p className="text-sm text-secondary">Listos para retiro hoy</p>
        </div>
        <Package
          size={120}
          className="absolute -right-4 -bottom-4 text-surface-low opacity-100 group-hover:opacity-60 transition-opacity"
          strokeWidth={1}
        />
      </div>

      <div className="bg-primary p-8 rounded-xl shadow-lg relative overflow-hidden group">
        <div className="relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-white/60 mb-4">
            En Tránsito
          </p>
          <h3 className="font-display text-5xl font-light mb-2 text-white">
            {inTransit}
          </h3>
          <div className="flex items-center gap-2 text-emerald-300 text-sm">
            <span>En camino</span>
          </div>
        </div>
        <Truck
          size={120}
          className="absolute -right-4 -bottom-4 text-white opacity-30 group-hover:opacity-20 transition-opacity"
          strokeWidth={1}
        />
      </div>

      <div className="bg-surface-high p-8 rounded-xl border border-outline-ghost shadow-sm relative overflow-hidden group">
        <div className="relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-secondary mb-4">
            Entregados (MTD)
          </p>
          <h3 className="font-display text-5xl font-light mb-2 text-primary">
            {delivered}
          </h3>
          <p className="text-sm text-secondary">Completados exitosamente</p>
        </div>
        <CheckCircle
          size={120}
          className="absolute -right-4 -bottom-4 text-surface-low opacity-100 group-hover:opacity-60 transition-opacity"
          strokeWidth={1}
        />
      </div>
    </div>
  )
}