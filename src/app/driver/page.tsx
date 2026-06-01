import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getLocalProfile, isAdmin } from '@/lib/auth-helpers'
import { DriverDashboard } from './components/DriverDashboard'
import { DriverFilterBar } from './components/DriverFilterBar'
import { EmptyState } from './components/EmptyState'

export default async function DriverPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const profile = await getLocalProfile()
  const admin = await isAdmin()

  if (!admin && (!profile || profile.type !== 'driver' || !profile.isActive)) {
    redirect('/unauthorized?reason=wrong-role')
  }

  const isSupervisor = admin
  const driver = isSupervisor ? null : profile!.profile

  const params = await searchParams
  const search = params.search || ''
  const statusFilter = params.status || 'ALL'

  const where: Record<string, unknown> = isSupervisor
    ? { driver_id: { not: null } }
    : { driver_id: driver!.id }

  if (search) {
    where.tracking_id = { contains: search, mode: 'insensitive' }
  }

  if (statusFilter !== 'ALL') {
    where.status = statusFilter
  }

  const rawShipments = await prisma.shipment.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: {
      driver: true,
      tracking_events: {
        orderBy: { timestamp: 'desc' },
      },
    },
  })

  const shipments = rawShipments.map((shipment) => ({
    id: shipment.id,
    tracking_id: shipment.tracking_id,
    status: shipment.status,
    type: shipment.type,
    delivery_address: shipment.delivery_address,
    created_at: shipment.created_at.toISOString(),
    tracking_events: shipment.tracking_events.map((event) => ({
      id: event.id,
      status: event.status,
      timestamp: event.timestamp.toISOString(),
      dateLabel: event.timestamp.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      shortDateLabel: event.timestamp.toLocaleString('es-ES', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    })),
    driver: shipment.driver
      ? { clerk_user_id: shipment.driver.clerk_user_id }
      : null,
  }))

  return (
    <main className="min-h-screen p-12 pb-32">
      <header className="mb-12">
        <span className="font-sans text-[11px] uppercase tracking-widest text-secondary">
          {isSupervisor ? 'Vista de Curador Principal' : 'Conductor'}
        </span>
        <h1 className="font-display text-5xl md:text-6xl mt-2 text-primary">
          {isSupervisor ? 'Supervisión de Traslados' : 'Bitácora del Conductor'}
        </h1>
        <p className="font-sans text-sm text-secondary mt-3">
          {isSupervisor
            ? 'Vista general de especímenes en tránsito bajo el cuidado de los conductores.'
            : 'Registro de traslados asignados a tu cuidado.'}
        </p>
      </header>

      <DriverFilterBar />

      {shipments.length === 0 ? (
        <EmptyState isSupervisor={isSupervisor} />
      ) : (
        <DriverDashboard shipments={shipments} isSupervisor={isSupervisor} />
      )}
    </main>
  )
}
