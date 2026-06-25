'use client'

import { useState } from 'react'
import { toggleDriverStatus, toggleOperatorStatus } from '../actions'
import { DRIVER_STATUS_LABELS, OPERATOR_STATUS_LABELS } from '@/lib/translations'
import { User, Pause, Play } from 'lucide-react'

export function UserCard({
  type,
  clerkUserId,
  status,
  driverId,
  operatorId,
}: {
  type: 'driver' | 'operator'
  clerkUserId: string
  status: string
  driverId?: string
  operatorId?: string
}) {
  const [loading, setLoading] = useState(false)
  const isDriver = type === 'driver'
  const config = isDriver
    ? { label: DRIVER_STATUS_LABELS[status] || status, className: status === 'SUSPENDED' ? 'bg-red-50 text-red-700' : status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' : status === 'ASSIGNED' ? 'bg-violet-50 text-violet-700' : 'bg-gray-100 text-gray-600' }
    : { label: OPERATOR_STATUS_LABELS[status] || status, className: status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600' }

  const handleToggle = async () => {
    setLoading(true)
    if (isDriver && driverId) {
      await toggleDriverStatus(driverId)
    } else if (!isDriver && operatorId) {
      await toggleOperatorStatus(operatorId)
    }
    setLoading(false)
  }

  const canToggle = isDriver ? !!driverId : !!operatorId
  const isBlocked = isDriver ? status === 'SUSPENDED' : status === 'INACTIVE'

  return (
    <div className="bg-surface-low rounded-2xl p-5 md:p-6 transition-all duration-300 hover:bg-surface-container">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-display text-xl text-primary break-all">
                {clerkUserId}
              </h3>
              <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-secondary">
                {isDriver ? 'Repartidor' : 'Operador'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 md:gap-8">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans ${config.className}`}
          >
            {config.label}
          </span>

          {canToggle && (
            <button
              onClick={handleToggle}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs uppercase tracking-[0.1em] font-sans font-medium transition-all ${
                isBlocked
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              } disabled:opacity-50`}
            >
              {isBlocked ? (
                <>
                  <Play size={14} strokeWidth={1.5} />
                  <span className="hidden sm:inline">Activar</span>
                </>
              ) : (
                <>
                  <Pause size={14} strokeWidth={1.5} />
                  <span className="hidden sm:inline">Suspender</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
