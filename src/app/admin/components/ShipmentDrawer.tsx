'use client'

import { useEffect } from 'react'
import { Shipment, Driver, LogisticOperator, TrackingEvent } from '@prisma/client'
import { StatusBadge } from './StatusBadge'
import { Timeline } from './Timeline'
import { X, Truck } from 'lucide-react'

type ShipmentWithRelations = Shipment & {
  driver: Driver | null
  operator: LogisticOperator | null
  tracking_events: TrackingEvent[]
}

export function ShipmentDrawer({
  shipment,
  onClose,
  onAssign,
}: {
  shipment: ShipmentWithRelations
  onClose: () => void
  onAssign: () => void
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-evergreen/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-bone shadow-2xl overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-moss">
              Shipment Details
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-low transition-all"
            >
              <X size={18} className="text-evergreen" strokeWidth={1.5} />
            </button>
          </div>

          <h2 className="font-display text-4xl text-evergreen mb-4">
            {shipment.tracking_id}
          </h2>
          <div className="mb-8">
            <StatusBadge status={shipment.status} />
          </div>

          <div className="space-y-6 mb-10">
            <div className="bg-surface-low rounded-xl p-5">
              <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-moss mb-1">
                Delivery Address
              </p>
              <p className="font-sans text-sm text-evergreen">
                {shipment.delivery_address}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-low rounded-xl p-5">
                <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-moss mb-1">
                  Order Ref
                </p>
                <p className="font-sans text-sm text-evergreen">
                  {shipment.order_id}
                </p>
              </div>
              <div className="bg-surface-low rounded-xl p-5">
                <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-moss mb-1">
                  Type
                </p>
                <p className="font-sans text-sm text-evergreen">
                  {shipment.type}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-low rounded-xl p-5">
                <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-moss mb-1">
                  Buyer
                </p>
                <p className="font-sans text-sm text-evergreen">
                  {shipment.buyer_id}
                </p>
              </div>
              <div className="bg-surface-low rounded-xl p-5">
                <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-moss mb-1">
                  Seller
                </p>
                <p className="font-sans text-sm text-evergreen">
                  {shipment.seller_id}
                </p>
              </div>
            </div>
          </div>

          {shipment.status === 'PENDING' && (
            <button
              onClick={onAssign}
              className="w-full flex items-center justify-center gap-2 py-4 bg-evergreen text-white rounded-xl text-xs uppercase tracking-[0.1em] font-sans font-medium hover:bg-evergreen/90 transition-all mb-10"
            >
              <Truck size={16} strokeWidth={1.5} />
              Assign Driver
            </button>
          )}

          {shipment.tracking_events.length > 0 && (
            <div>
              <h3 className="font-sans text-[11px] uppercase tracking-[0.2em] text-moss mb-6">
                Curated History
              </h3>
              <Timeline events={shipment.tracking_events} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}