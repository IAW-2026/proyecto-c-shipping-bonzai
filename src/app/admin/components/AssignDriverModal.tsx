'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Driver } from '@prisma/client'
import { X, User, Check } from 'lucide-react'
import { assignDriver } from '../shipments/actions'

export function AssignDriverModal({
  shipmentId,
  onClose,
}: {
  shipmentId: string
  onClose: () => void
}) {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const router = useRouter()

  useState(() => {
    fetch('/api/drivers/available')
      .then((res) => res.json())
      .then((data) => {
        setDrivers(data.drivers || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  })

  const handleAssign = async (driverId: string) => {
    setAssigning(true)
    try {
      await assignDriver(shipmentId, driverId)
      setShowToast(true)
      setTimeout(() => {
        setShowToast(false)
        onClose()
        router.refresh()
      }, 2000)
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-evergreen/30 backdrop-blur-[20px]"
        onClick={onClose}
      />
      <div className="relative bg-bone rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-2xl text-evergreen">
              Select Driver
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-low transition-all"
            >
              <X size={18} className="text-evergreen" strokeWidth={1.5} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-surface-low rounded-xl animate-pulse" />
              ))}
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-sans text-sm text-moss">
                No drivers available
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {drivers.map((driver) => (
                <button
                  key={driver.id}
                  onClick={() => handleAssign(driver.id)}
                  disabled={assigning}
                  className="w-full flex items-center gap-4 p-4 bg-surface-low rounded-xl hover:bg-surface-container transition-all disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-full bg-evergreen/10 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-evergreen" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-sans text-sm font-medium text-evergreen">
                      {driver.clerk_user_id}
                    </p>
                    <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-moss">
                      {driver.status}
                    </p>
                  </div>
                  <Check size={16} className="text-moss opacity-0 group-hover:opacity-100" strokeWidth={1.5} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showToast && (
        <div className="fixed top-6 right-6 z-[70]">
          <div className="backdrop-blur-[20px] bg-evergreen/90 text-white px-6 py-3 rounded-xl shadow-lg">
            <p className="font-sans text-sm font-medium">
              Driver assigned successfully
            </p>
          </div>
        </div>
      )}
    </div>
  )
}