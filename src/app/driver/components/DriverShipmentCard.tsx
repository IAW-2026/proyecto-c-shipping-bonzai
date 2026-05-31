'use client'

import { useState } from 'react'
import { confirmPickup, confirmDelivery } from '@/lib/actions/driver'
import { Package, MapPin, Copy, Check, Truck, CheckCircle } from 'lucide-react'

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

interface Shipment {
  id: string
  tracking_id: string
  status: string
  type: string
  delivery_address: string
  created_at: Date
  tracking_events: { status: string; timestamp: Date }[]
  driver?: {
    clerk_user_id: string
    name: string
  }
}

export function DriverShipmentCard({ shipment,isSupervisor }: { shipment: Shipment; isSupervisor?: boolean }) {
  const [copied, setCopied] = useState(false)
  const [loadingPickup, setLoadingPickup] = useState(false)
  const [loadingDelivery, setLoadingDelivery] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(shipment.delivery_address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePickup = async () => {
    setLoadingPickup(true)
    setResult(null)
    const res = await confirmPickup(shipment.id)
    setResult(res)
    setLoadingPickup(false)
    if (res.success) {
      window.location.reload()
    }
  }

  const handleDelivery = async () => {
    setLoadingDelivery(true)
    setResult(null)
    const res = await confirmDelivery(shipment.id)
    setResult(res)
    setLoadingDelivery(false)
    if (res.success) {
      window.location.reload()
    }
  }

  const lastEvent = shipment.tracking_events[0]

  return (
    <div className="bg-white rounded-2xl p-6 hover:bg-surface-container transition-colors">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
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
            <span className="font-sans text-sm text-secondary">{shipment.type}</span>
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
              Último registro: {lastEvent.status} — {new Date(lastEvent.timestamp).toLocaleString('es-ES', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}

          {isSupervisor && shipment.driver && (
            <p className="font-sans text-xs text-secondary/60">
              Conductor asignado: {shipment.driver.clerk_user_id}
            </p>
          )}

          {result?.error && (
            <p className="font-sans text-xs text-red-600 mt-2">
              {result.error}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          {shipment.status === 'PENDING' && (
            <button
              onClick={handlePickup}
              disabled={loadingPickup}
              className="w-full md:w-auto h-11 px-6 bg-[#03271a] text-[#faf9f4] rounded-xl font-sans text-sm font-medium hover:bg-[#03271a]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Truck size={16} strokeWidth={1.5} />
              {loadingPickup ? 'Procesando...' : 'Confirmar Retiro'}
            </button>
          )}

          {shipment.status === 'IN_TRANSIT' && (
            <button
              onClick={handleDelivery}
              disabled={loadingDelivery}
              className="w-full md:w-auto h-11 px-6 bg-[#03271a] text-[#faf9f4] rounded-xl font-sans text-sm font-medium hover:bg-[#03271a]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} strokeWidth={1.5} />
              {loadingDelivery ? 'Procesando...' : 'Confirmar Entrega'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
