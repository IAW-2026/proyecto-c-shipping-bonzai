'use client'

import { useState } from 'react'
import { Shipment, Driver, LogisticOperator, TrackingEvent, ShipmentType } from '@prisma/client'
import { StatusBadge } from './StatusBadge'
import { ShipmentDrawer } from './ShipmentDrawer'
import { AssignDriverModal } from './AssignDriverModal'
import { Truck } from 'lucide-react'

type ShipmentWithRelations = Shipment & {
  driver: Driver | null
  operator: LogisticOperator | null
  tracking_events: TrackingEvent[]
}

const typeLabels: Record<ShipmentType, string> = {
  PLANTA_VIVA: 'Planta Viva',
  INSUMOS: 'Insumos',
  FRAGIL: 'Fragil',
  SEMILLAS: 'Semillas',
  OTROS: 'Otros',
}

export function CuratedCard({ shipment }: { shipment: ShipmentWithRelations }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)

  return (
    <>
      <div
        onClick={() => setDrawerOpen(true)}
        className="group cursor-pointer bg-surface-low rounded-2xl p-5 md:p-6 transition-all duration-300 hover:bg-surface-container"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-display text-xl md:text-2xl text-evergreen">
                {shipment.tracking_id}
              </h3>
              <StatusBadge status={shipment.status} />
            </div>
            <p className="font-sans text-xs uppercase tracking-[0.1em] text-moss mb-1">
              {typeLabels[shipment.type]}
            </p>
            <p className="font-sans text-sm text-evergreen/70 truncate">
              {shipment.delivery_address}
            </p>
          </div>

          <div className="flex items-center gap-6 md:gap-8">
            <div className="hidden md:block text-right">
              <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-moss">
                Order
              </p>
              <p className="font-sans text-sm text-evergreen">
                {shipment.order_id}
              </p>
            </div>
            <div className="hidden md:block text-right">
              <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-moss">
                Created
              </p>
              <p className="font-sans text-sm text-evergreen">
                {new Date(shipment.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
            {shipment.status === 'PENDING' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setAssignModalOpen(true)
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-evergreen text-white rounded-lg text-xs uppercase tracking-[0.1em] font-sans font-medium hover:bg-evergreen/90 transition-all"
              >
                <Truck size={14} strokeWidth={1.5} />
                <span className="hidden sm:inline">Assign</span>
              </button>
            )}
            {shipment.driver && (
              <div className="text-right">
                <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-moss">
                  Driver
                </p>
                <p className="font-sans text-sm text-evergreen">
                  {shipment.driver.clerk_user_id.slice(0, 12)}...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {drawerOpen && (
        <ShipmentDrawer
          shipment={shipment}
          onClose={() => setDrawerOpen(false)}
          onAssign={() => setAssignModalOpen(true)}
        />
      )}

      {assignModalOpen && (
        <AssignDriverModal
          shipmentId={shipment.id}
          onClose={() => setAssignModalOpen(false)}
        />
      )}
    </>
  )
}