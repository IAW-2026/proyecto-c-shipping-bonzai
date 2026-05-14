import { ShipmentStatus } from '@prisma/client'

const statusConfig: Record<ShipmentStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-umber/10 text-umber',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    className: 'bg-moss/10 text-moss',
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-evergreen/10 text-evergreen',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-900/10 text-red-800',
  },
}

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  const config = statusConfig[status]
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.15em] font-medium font-sans ${config.className}`}
    >
      {config.label}
    </span>
  )
}