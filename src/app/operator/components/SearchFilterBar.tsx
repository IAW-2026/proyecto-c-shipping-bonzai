'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useCallback, useState } from 'react'

const statusOptions = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'ASSIGNED', label: 'Asignado' },
  { value: 'IN_TRANSIT', label: 'En tránsito' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

export function SearchFilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const currentStatus = searchParams.get('status') || 'ALL'

  const updateParams = useCallback(
    (newSearch: string, newStatus: string) => {
      const params = new URLSearchParams()
      if (newSearch) params.set('search', newSearch)
      if (newStatus && newStatus !== 'ALL') params.set('status', newStatus)
      params.set('page', '1')
      router.push(`/operator/dashboard?${params.toString()}`)
    },
    [router]
  )

  const handleSearch = (value: string) => {
    setSearch(value)
    updateParams(value, currentStatus)
  }

  const handleStatusChange = (status: string) => {
    updateParams(search, status)
  }

  return (
    <div className="space-y-4 mb-8">
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary"
          strokeWidth={1.5}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
           placeholder="Buscar tracking ID..."
          className="w-full pl-11 pr-4 py-3 bg-surface-low rounded-xl text-sm font-sans text-primary placeholder:text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal size={14} className="text-secondary mr-1" strokeWidth={1.5} />
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={`px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-[0.1em] font-sans font-medium transition-all duration-300 ${
              currentStatus === option.value
                ? 'bg-primary text-white'
                : 'bg-surface-low text-secondary hover:bg-surface-container'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}