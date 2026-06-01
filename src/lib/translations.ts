export const SHIPMENT_TYPE_LABELS: Record<string, string> = {
  PLANTA_VIVA: 'Planta Viva',
  INSUMOS: 'Insumos',
  FRAGIL: 'Frágil',
  SEMILLAS: 'Semillas',
  OTROS: 'Otros',
}

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  ASSIGNED: 'Asignado',
  IN_TRANSIT: 'En tránsito',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

export const TRACKING_STATUS_LABELS: Record<string, string> = {
  RECIBIDO_EN_ORIGEN: 'Recibido en Origen',
  EN_TRANSITO: 'En Tránsito',
  ENTREGADO: 'Entregado',
}

export const DRIVER_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Disponible',
  ASSIGNED: 'Asignado',
  SUSPENDED: 'Suspendido',
  INACTIVE: 'Inactivo',
}

export const OPERATOR_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
}
