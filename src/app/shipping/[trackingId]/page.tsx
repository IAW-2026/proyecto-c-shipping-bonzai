import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getPoeticMessage } from '@/lib/tracking-messages'
import { Package, ArrowLeft, MapPin, Calendar, User } from 'lucide-react'

function getRolesFromClaims(sessionClaims: unknown): string[] {
  const claims = sessionClaims as {
    roles?: string | string[]
    publicMetadata?: { roles?: string | string[] }
  } | null
  const raw = claims?.roles || claims?.publicMetadata?.roles || []
  return Array.isArray(raw) ? raw : [raw]
}

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

export default async function ShippingDetailPage({
  params,
}: {
  params: Promise<{ trackingId: string }>
}) {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const { trackingId } = await params

  const shipment = await prisma.shipment.findUnique({
    where: { tracking_id: trackingId },
    include: {
      tracking_events: {
        orderBy: { timestamp: 'desc' },
      },
      operator: true,
      driver: true,
    },
  })

  if (!shipment) {
    redirect('/shipping')
  }

  const roles = getRolesFromClaims(sessionClaims)
  const isAdminOrOperator =
    roles.includes('shipping_admin') || roles.includes('operator_shipping')

  if (
    !isAdminOrOperator &&
    shipment.buyer_id !== userId &&
    shipment.seller_id !== userId
  ) {
    redirect('/unauthorized?reason=wrong-role')
  }

  const isSeller = shipment.seller_id === userId
  const isBuyer = shipment.buyer_id === userId

  return (
    <main className="min-h-screen p-12 pb-32">
      <header className="mb-12">
        <a
          href="/shipping"
          className="inline-flex items-center gap-2 font-sans text-sm text-secondary hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Volver a mis envíos
        </a>
        <div className="flex items-center gap-3 mb-2">
          <span className="font-sans text-[11px] uppercase tracking-widest text-secondary">
            Seguimiento
          </span>
          <span
            className={`px-3 py-1 rounded-full font-sans text-xs font-medium ${getStatusColor(shipment.status)}`}
          >
            {getStatusLabel(shipment.status)}
          </span>
        </div>
        <h1 className="font-display text-5xl md:text-6xl mt-2 text-primary">
          {shipment.tracking_id}
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-8">
            <h2 className="font-display text-2xl text-primary mb-6">
              Diario de Tránsito
            </h2>
            {shipment.tracking_events.length === 0 ? (
              <div className="text-center py-8">
                <Package size={32} className="text-secondary/40 mx-auto mb-3" strokeWidth={1.5} />
                <p className="font-sans text-sm text-secondary">
                  Aún no hay entradas en el diario de este espécimen.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {shipment.tracking_events.map((event, index) => (
                  <div key={event.id} className="relative pl-8">
                    {index !== shipment.tracking_events.length - 1 && (
                      <div className="absolute left-[11px] top-7 bottom-[-24px] w-px bg-surface-container" />
                    )}
                    <div className="absolute left-0 top-1 w-6 h-6 bg-surface-low rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <div>
                      <p className="font-sans text-sm font-medium text-primary">
                        {event.status}
                      </p>
                      <p className="font-sans text-sm text-secondary mt-1">
                        {getPoeticMessage(event.status)}
                      </p>
                      <p className="font-sans text-xs text-secondary/60 mt-2">
                        {new Date(event.timestamp).toLocaleString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6">
            <h3 className="font-display text-lg text-primary mb-4">
              Detalles del Envío
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Package size={16} className="text-secondary shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="font-sans text-xs text-secondary uppercase tracking-wider">
                    Tipo
                  </p>
                  <p className="font-sans text-sm text-primary">{shipment.type}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-secondary shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="font-sans text-xs text-secondary uppercase tracking-wider">
                    Dirección
                  </p>
                  <p className="font-sans text-sm text-primary">{shipment.delivery_address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-secondary shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="font-sans text-xs text-secondary uppercase tracking-wider">
                    Creado
                  </p>
                  <p className="font-sans text-sm text-primary">
                    {new Date(shipment.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User size={16} className="text-secondary shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="font-sans text-xs text-secondary uppercase tracking-wider">
                    Rol en este envío
                  </p>
                  <p className="font-sans text-sm text-primary">
                    {isSeller && isBuyer
                      ? 'Vendedor y Comprador'
                      : isSeller
                        ? 'Vendedor'
                        : isBuyer
                          ? 'Comprador'
                          : 'Observador'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {shipment.operator && (
            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-display text-lg text-primary mb-3">
                Operador Asignado
              </h3>
              <p className="font-sans text-sm text-secondary">
                {shipment.operator.clerk_user_id.slice(0, 12)}...
              </p>
            </div>
          )}

          {shipment.driver && (
            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-display text-lg text-primary mb-3">
                Conductor
              </h3>
              <p className="font-sans text-sm text-secondary">
                {shipment.driver.clerk_user_id.slice(0, 12)}...
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
