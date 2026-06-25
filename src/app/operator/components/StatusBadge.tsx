import { ShipmentStatus } from '@prisma/client'

const statusConfig: Record<ShipmentStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pendiente',
    className: 'bg-status-amber text-status-amber-text',
  },
  ASSIGNED: {
    label: 'Asignado',
    className: 'bg-violet-100 text-violet-800',
  },
  IN_TRANSIT: {
    label: 'En tránsito',
    className: 'bg-status-blue text-status-blue-text',
  },
  DELIVERED: {
    label: 'Entregado',
    className: 'bg-status-green text-status-green-text',
  },
  CANCELLED: {
    label: 'Cancelado',
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