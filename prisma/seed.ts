import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL
const adapter = new PrismaPg(new pg.Pool({ connectionString }))
const prisma = new PrismaClient({ adapter })

const KNOWN_SEED_DRIVER_IDS = [
  'user_2drvAvail001',
  'user_2drvAssign002',
  'user_2drvInact003',
]

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function trackingId(index: number): string {
  return `BOT-${String(index).padStart(8, '0')}`
}

const ADDRESSES = [
  'Av. Siempre Viva 123, Ciudad Botanica',
  'Calle Las Orquideas 456, Sector Norte',
  'Boulevard Los Robles 789, Distrito Floral',
  'Pasaje del Sol 101, Zona Centro',
  'Calle Los Pinos 222, Residencial Bosque',
  'Avenida Palmas 333, Altos del Valle',
  'Camino del Vivero 555, La Floresta',
  'Sendero del Jardin 77, Villa Verde',
  'Diagonal las Palmeras 111, Barrio del Sol',
  'Callejon de las Flores 234, Villa Jardin',
  'Ruta del Botanico 890, El Vergel',
  'Pasaje del Helecho 456, Ciudad Jardin',
  'Av. del Curador 100, Centro Botanico',
  'Calle del Especimen 789, Residencial Flora',
  'Boulevard de los Viveros 321, Sector Raiz',
]

const TYPES = ['PLANTA_VIVA', 'INSUMOS', 'FRAGIL', 'SEMILLAS', 'OTROS'] as const

const EVENT_CHAIN: Record<string, string[]> = {
  PENDING: ['RECIBIDO_EN_ORIGEN'],
  ASSIGNED: ['RECIBIDO_EN_ORIGEN', 'ASIGNADO_A_REPARTIDOR'],
  IN_TRANSIT: ['RECIBIDO_EN_ORIGEN', 'ASIGNADO_A_REPARTIDOR', 'EN_TRANSITO'],
  DELIVERED: ['RECIBIDO_EN_ORIGEN', 'ASIGNADO_A_REPARTIDOR', 'EN_TRANSITO', 'ENTREGADO'],
  CANCELLED: ['RECIBIDO_EN_ORIGEN', 'CANCELADO'],
}

interface ShipmentRecord {
  id: string
  status: string
  created_at: Date
  delivered_at: Date | null
}

async function main() {
  await prisma.trackingEvent.deleteMany()
  await prisma.shipment.deleteMany()

  const existingOperator = await prisma.logisticOperator.findFirst({
    where: { clerk_user_id: { notIn: ['user_2opLogistics999'] } },
    orderBy: { created_at: 'desc' },
  })
  const existingDriver = await prisma.driver.findFirst({
    where: { clerk_user_id: { notIn: KNOWN_SEED_DRIVER_IDS } },
    orderBy: { created_at: 'desc' },
  })

  const realOperatorId = existingOperator?.id
  const realDriverId = existingDriver?.id

  if (!realOperatorId || !realDriverId) {
    console.log('')
    console.log('WARNING: No real users found (created by lazy sync).')
    console.log('To link seed shipments to your test accounts:')
    console.log('  1. Sign in to the app with operator+clerktest@iaw.com')
    console.log('  2. Sign in to the app with driver+clerktest@iaw.com')
    console.log('  3. Re-run npx prisma db seed')
    console.log('')
  }

  const opUserId = realOperatorId ? existingOperator!.clerk_user_id : 'user_2opLogistics999'
  const drvUserId = realDriverId ? existingDriver!.clerk_user_id : 'user_2drvAvail001'

  const operator = await prisma.logisticOperator.upsert({
    where: { clerk_user_id: 'user_2opLogistics999' },
    update: {},
    create: { clerk_user_id: 'user_2opLogistics999', status: 'ACTIVE' },
  })

  const driverSeed = await prisma.driver.upsert({
    where: { clerk_user_id: 'user_2drvAvail001' },
    update: {},
    create: { clerk_user_id: 'user_2drvAvail001', status: 'AVAILABLE' },
  })

  const driverAssigned = await prisma.driver.upsert({
    where: { clerk_user_id: 'user_2drvAssign002' },
    update: {},
    create: { clerk_user_id: 'user_2drvAssign002', status: 'ASSIGNED' },
  })

  let realDriverRecord = driverSeed
  if (realDriverId && existingDriver) {
    realDriverRecord = existingDriver
  }

  const drivers = [realDriverRecord, driverAssigned]
  let driverRoundRobin = 0
  function nextDriver() {
    const d = drivers[driverRoundRobin % drivers.length]
    driverRoundRobin++
    return d
  }

  const allShipments: ShipmentRecord[] = []
  const now = new Date()
  let counter = 0

  function newCounter(): number {
    counter++
    return counter
  }

  function padded(num: number): string {
    return String(num).padStart(6, '0')
  }

  async function createShipment(
    status: string,
    createdAt: Date,
    deliveredAt: Date | null,
    assignDriver: boolean,
  ): Promise<ShipmentRecord> {
    const idx = newCounter()
    const ship = await prisma.shipment.create({
      data: {
        tracking_id: trackingId(idx),
        order_id: `ORD-${padded(idx)}`,
        transaction_id: `TXN-${padded(idx)}`,
        buyer_id: `user_2buyer${padded(idx)}`,
        seller_id: `user_2seller${padded(idx)}`,
        status: status as any,
        delivery_address: pick(ADDRESSES),
        type: pick(TYPES) as any,
        created_at: createdAt,
        delivered_at: deliveredAt,
        operator_id: operator.id,
        driver_id: assignDriver ? nextDriver().id : null,
      },
    })
    return { id: ship.id, status, created_at: createdAt, delivered_at: deliveredAt }
  }

  for (let i = 0; i < 40; i++) {
    const created = daysAgo(randomInt(15, 90))
    const delivered = new Date(created.getTime() + randomInt(1, 3) * 24 * 60 * 60 * 1000)
    allShipments.push(await createShipment('DELIVERED', created, delivered, true))
  }
  for (let i = 0; i < 10; i++) {
    const created = daysAgo(randomInt(15, 90))
    allShipments.push(await createShipment('CANCELLED', created, null, Math.random() < 0.5))
  }

  for (let i = 0; i < 18; i++) {
    const created = daysAgo(randomInt(3, 15))
    const delivered = new Date(created.getTime() + randomInt(1, 2) * 24 * 60 * 60 * 1000)
    allShipments.push(await createShipment('DELIVERED', created, delivered, true))
  }
  for (let i = 0; i < 7; i++) {
    const created = daysAgo(randomInt(3, 15))
    allShipments.push(await createShipment('IN_TRANSIT', created, null, true))
  }

  for (let i = 0; i < 6; i++) {
    const created = daysAgo(randomInt(1, 3))
    const deliveryMs = randomInt(12, 36) * 60 * 60 * 1000
    const delivered = new Date(Math.min(created.getTime() + deliveryMs, now.getTime()))
    allShipments.push(await createShipment('DELIVERED', created, delivered, true))
  }
  for (let i = 0; i < 5; i++) {
    const created = daysAgo(randomInt(1, 3))
    allShipments.push(await createShipment('IN_TRANSIT', created, null, true))
  }
  for (let i = 0; i < 4; i++) {
    const created = daysAgo(randomInt(1, 3))
    allShipments.push(await createShipment('ASSIGNED', created, null, true))
  }

  for (let i = 0; i < 5; i++) {
    const created = daysAgo(0)
    allShipments.push(await createShipment('PENDING', created, null, false))
  }
  for (let i = 0; i < 3; i++) {
    const created = daysAgo(0)
    allShipments.push(await createShipment('ASSIGNED', created, null, true))
  }
  for (let i = 0; i < 2; i++) {
    const created = daysAgo(0)
    allShipments.push(await createShipment('IN_TRANSIT', created, null, true))
  }

  for (const shipment of allShipments) {
    const eventStatuses = EVENT_CHAIN[shipment.status]
    if (!eventStatuses) continue

    const spanMs = shipment.delivered_at
      ? shipment.delivered_at.getTime() - shipment.created_at.getTime()
      : now.getTime() - shipment.created_at.getTime()

    const totalEvents = eventStatuses.length
    const eventData = eventStatuses.map((eventStatus, i) => {
      const fraction = totalEvents > 1 ? i / (totalEvents - 1) : 0
      return {
        shipment_id: shipment.id,
        status: eventStatus,
        timestamp: new Date(shipment.created_at.getTime() + fraction * spanMs),
      }
    })

    await prisma.trackingEvent.createMany({ data: eventData })
  }

  if (realOperatorId) {
    console.log(`Real operator linked: ${opUserId}`)
  } else {
    console.log('Seed operator used: user_2opLogistics999')
  }
  if (realDriverId) {
    console.log(`Real driver linked: ${drvUserId}`)
  } else {
    console.log('Seed driver used: user_2drvAvail001')
  }

  const statusCounts: Record<string, number> = {}
  for (const s of allShipments) {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1
  }

  console.log(`\n${allShipments.length} shipments created:`)
  for (const status of ['DELIVERED', 'CANCELLED', 'IN_TRANSIT', 'ASSIGNED', 'PENDING']) {
    const count = statusCounts[status] || 0
    if (count > 0) {
      console.log(`  ${count} ${status}`)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
