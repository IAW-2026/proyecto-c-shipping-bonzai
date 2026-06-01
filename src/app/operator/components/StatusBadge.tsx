import { ShipmentStatus } from '@prisma/client'

const statusConfig: Record<ShipmentStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Packing',
    className: 'bg-status-amber text-status-amber-text',
  },
  ASSIGNED: {
    label: 'Assigned',
    className: 'bg-violet-100 text-violet-800',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    className: 'bg-status-blue text-status-blue-text',
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-status-green text-status-green-text',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800',
  },
}

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  const config = statusConfig[status]
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans ${config.className}`}
    >
      {config.label}
    </span>
  )
}