import { TrackingEvent } from '@prisma/client'
import { Package, Truck, CheckCircle } from 'lucide-react'
import { TRACKING_STATUS_LABELS } from '@/lib/translations'

const eventIcons: Record<string, React.ReactNode> = {
  'RECIBIDO_EN_ORIGEN': <Package size={14} strokeWidth={1.5} />,
  'En camino': <Truck size={14} strokeWidth={1.5} />,
  'Entregado': <CheckCircle size={14} strokeWidth={1.5} />,
  'Recibido': <Package size={14} strokeWidth={1.5} />,
}

export function Timeline({ events }: { events: TrackingEvent[] }) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  return (
    <div className="space-y-0">
      {sorted.map((event, index) => {
        const isLast = index === sorted.length - 1
        const icon = eventIcons[event.status] || <Package size={14} strokeWidth={1.5} />

        return (
          <div key={event.id} className="relative flex gap-4">
            {!isLast && (
              <div className="absolute left-[11px] top-7 bottom-0 w-px bg-surface-container" />
            )}
            <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-surface-low flex items-center justify-center">
              <span className="text-secondary">{icon}</span>
            </div>
            <div className={`pb-6 flex-1 ${index % 2 === 0 ? 'bg-surface-low/50' : ''} rounded-lg px-3 py-2`}>
              <p className="font-display text-base text-primary">
                {TRACKING_STATUS_LABELS[event.status] || event.status}
              </p>
              <p className="font-sans text-[11px] text-secondary mt-1">
                {new Date(event.timestamp).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}