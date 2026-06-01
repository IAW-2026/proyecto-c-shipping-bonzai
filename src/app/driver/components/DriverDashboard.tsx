'use client'

import { useState } from 'react'
import { confirmPickup, confirmDelivery } from '@/lib/actions/driver'
import { Package, MapPin, Copy, Check, Sprout, Leaf } from 'lucide-react'
import { SHIPMENT_TYPE_LABELS, TRACKING_STATUS_LABELS } from '@/lib/translations'
import { getPoeticMessage } from '@/lib/tracking-messages'

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    ASSIGNED: 'Asignado',
    IN_TRANSIT: 'En tránsito',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
  }
  return labels[status] || status
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700',
    ASSIGNED: 'bg-violet-50 text-violet-700',
    IN_TRANSIT: 'bg-blue-50 text-blue-700',
    DELIVERED: 'bg-emerald-50 text-emerald-700',
    CANCELLED: 'bg-red-50 text-red-700',
  }
  return colors[status] || 'bg-surface-low text-secondary'
}

interface TrackingEvent {
  id: string
  status: string
  timestamp: string
  dateLabel: string
  shortDateLabel: string
}

interface Shipment {
  id: string
  tracking_id: string
  status: string
  type: string
  delivery_address: string
  created_at: string
  tracking_events: TrackingEvent[]
  driver?: { clerk_user_id: string } | null
}

export function DriverShipmentCard({
  shipment,
  isSelected,
  onClick,
}: {
  shipment: Shipment
  isSelected: boolean
  onClick: () => void
}) {
  const [copied, setCopied] = useState(false)
  const lastEvent = shipment.tracking_events[0]

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(shipment.delivery_address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={`w-full text-left bg-white rounded-2xl p-6 transition-colors cursor-pointer ${
        isSelected ? 'bg-surface-container ring-2 ring-primary/20' : 'hover:bg-surface-container'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="font-display text-xl text-primary">
          {shipment.tracking_id}
        </span>
        <span
          className={`px-3 py-1 rounded-full font-sans text-xs font-medium ${getStatusColor(shipment.status)}`}
        >
          {getStatusLabel(shipment.status)}
        </span>
      </div>

      <div className="flex items-start gap-2 mb-3">
        <Package size={16} className="text-secondary shrink-0 mt-0.5" strokeWidth={1.5} />
          <span className="font-sans text-sm text-secondary">{SHIPMENT_TYPE_LABELS[shipment.type] || shipment.type}</span>
      </div>

      <div className="flex items-start gap-2 mb-3">
        <MapPin size={16} className="text-secondary shrink-0 mt-0.5" strokeWidth={1.5} />
        <span className="font-sans text-sm text-primary flex-1">{shipment.delivery_address}</span>
        <button
          onClick={handleCopy}
          className="shrink-0 p-1.5 bg-surface-low rounded-lg hover:bg-surface-container transition-colors"
          title="Copiar dirección"
        >
          {copied ? (
            <Check size={14} className="text-emerald-600" strokeWidth={1.5} />
          ) : (
            <Copy size={14} className="text-secondary" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {lastEvent && (
        <p className="font-sans text-xs text-secondary/60">
          {lastEvent.shortDateLabel} — {getPoeticMessage(lastEvent.status)}
        </p>
      )}
    </div>
  )
}

export function DriverDashboard({
  shipments,
  isSupervisor,
}: {
  shipments: Shipment[]
  isSupervisor: boolean
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    shipments.length > 0 ? shipments[0].id : null
  )
  const [loading, setLoading] = useState(false)

  const selectedShipment = shipments.find((s) => s.id === selectedId) || null

  const handleAction = async () => {
    if (!selectedShipment) return
    setLoading(true)

    const res =
      selectedShipment.status === 'ASSIGNED'
        ? await confirmPickup(selectedShipment.id)
        : await confirmDelivery(selectedShipment.id)

    setLoading(false)
    if (res.success) {
      window.location.reload()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        {shipments.map((shipment) => (
          <DriverShipmentCard
            key={shipment.id}
            shipment={shipment}
            isSelected={shipment.id === selectedId}
            onClick={() => setSelectedId(shipment.id)}
          />
        ))}
      </div>

      <div className="lg:sticky lg:top-12 lg:self-start">
        {selectedShipment ? (
          <div className="bg-white rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-display text-3xl text-primary">
                {selectedShipment.tracking_id}
              </span>
              <span
                className={`px-3 py-1 rounded-full font-sans text-xs font-medium ${getStatusColor(selectedShipment.status)}`}
              >
                {getStatusLabel(selectedShipment.status)}
              </span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Package size={16} className="text-secondary shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="font-sans text-xs text-secondary uppercase tracking-wider">Tipo</p>
                  <p className="font-sans text-sm text-primary">{SHIPMENT_TYPE_LABELS[selectedShipment.type] || selectedShipment.type}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-secondary shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="font-sans text-xs text-secondary uppercase tracking-wider">Dirección</p>
                  <p className="font-sans text-sm text-primary">{selectedShipment.delivery_address}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-display text-xl text-primary mb-4">Diario de Tránsito</h3>
              {selectedShipment.tracking_events.length === 0 ? (
                <div className="text-center py-6">
                  <Leaf size={24} className="text-secondary/40 mx-auto mb-2" strokeWidth={1.5} />
                  <p className="font-sans text-sm text-secondary">Aún no hay entradas en el diario.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {selectedShipment.tracking_events.map((event, index) => (
                    <div key={event.id} className="relative pl-8">
                      {index !== selectedShipment.tracking_events.length - 1 && (
                        <div className="absolute left-[11px] top-7 bottom-[-20px] w-px bg-surface-container" />
                      )}
                      <div className="absolute left-0 top-1 w-6 h-6 bg-surface-low rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      </div>
                      <div>
                        <p className="font-sans text-sm font-medium text-primary">{TRACKING_STATUS_LABELS[event.status] || event.status}</p>
                        <p className="font-sans text-sm text-secondary mt-1">
                          {getPoeticMessage(event.status)}
                        </p>
                        <p className="font-sans text-xs text-secondary/60 mt-1">
                          {event.dateLabel}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!isSupervisor && selectedShipment.status !== 'DELIVERED' && (
              <button
                onClick={handleAction}
                disabled={loading}
                className="w-full h-14 bg-[#03271a] text-[#faf9f4] rounded-xl font-sans text-base font-medium hover:bg-[#03271a]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading
                  ? 'Procesando...'
                  : selectedShipment.status === 'ASSIGNED'
                    ? 'Marcar como retirado'
                    : 'Marcar como entregado'}
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="flex justify-center mb-6">
              <Sprout size={40} className="text-secondary/40" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-2xl text-primary mb-2">
              Seleccioná un envío
            </h2>
            <p className="font-sans text-sm text-secondary">
              Elegí un espécimen de tu bitácora para ver su diario de tránsito.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
