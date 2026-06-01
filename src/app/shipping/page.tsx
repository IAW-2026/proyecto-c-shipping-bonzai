import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SHIPMENT_TYPE_LABELS } from '@/lib/translations'
import { getPoeticMessage } from '@/lib/tracking-messages'
import { Package, ArrowRight, Clock } from 'lucide-react'

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    IN_TRANSIT: 'En tránsito',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
  }
  return labels[status] || status
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700',
    IN_TRANSIT: 'bg-blue-50 text-blue-700',
    DELIVERED: 'bg-emerald-50 text-emerald-700',
    CANCELLED: 'bg-red-50 text-red-700',
  }
  return colors[status] || 'bg-surface-low text-secondary'
}

export default async function ShippingPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const shipments = await prisma.shipment.findMany({
    where: {
      OR: [{ buyer_id: userId }, { seller_id: userId }],
    },
    orderBy: { created_at: 'desc' },
    include: {
      tracking_events: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
  })

  return (
    <main className="min-h-screen p-12 pb-32">
      <header className="mb-12">
        <span className="font-sans text-[11px] uppercase tracking-widest text-secondary">
          Mi Jardín Botánico
        </span>
        <h1 className="font-display text-5xl md:text-6xl mt-2 text-primary">
          Mis Envíos
        </h1>
        <p className="font-sans text-sm text-secondary mt-3">
          Colección de especímenes en tránsito hacia sus destinos.
        </p>
      </header>

      {shipments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="flex justify-center mb-6">
            <Package size={40} className="text-secondary/40" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-2xl text-primary mb-2">
            El invernadero está vacío.
          </h2>
          <p className="font-sans text-sm text-secondary">
            No tienes envíos registrados en este momento.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {shipments.map((shipment) => {
            const lastEvent = shipment.tracking_events[0]
            const poeticMessage = lastEvent
              ? getPoeticMessage(lastEvent.status)
              : 'El espécimen espera ser catalogado'

            return (
              <a
                key={shipment.id}
                href={`/shipping/${shipment.tracking_id}`}
                className="block bg-white rounded-2xl p-6 hover:bg-surface-container transition-colors group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-display text-xl text-primary">
                        {shipment.tracking_id}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full font-sans text-xs font-medium ${getStatusColor(shipment.status)}`}
                      >
                        {getStatusLabel(shipment.status)}
                      </span>
                    </div>
                    <p className="font-sans text-sm text-secondary">
                      {poeticMessage}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="font-sans text-xs text-secondary/60">
                        {SHIPMENT_TYPE_LABELS[shipment.type] || shipment.type}
                      </span>
                      <span className="font-sans text-xs text-secondary/60 flex items-center gap-1">
                        <Clock size={12} strokeWidth={1.5} />
                        {new Date(shipment.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-surface-low rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <ArrowRight size={18} strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </main>
  )
}
