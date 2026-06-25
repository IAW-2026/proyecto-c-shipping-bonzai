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

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000)
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
    console.log('ADVERTENCIA: No se encontraron usuarios reales (creados por lazy sync).')
    console.log('Para que los envíos del seed se vinculen a tus cuentas de prueba:')
    console.log('  1. Inicia sesion en la app con operator+clerktest@iaw.com')
    console.log('  2. Inicia sesion en la app con driver+clerktest@iaw.com')
    console.log('  3. Vuelve a ejecutar npx prisma db seed')
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

  const now = new Date()
  const threeDaysAgo = hoursAgo(72)
  const twoDaysAgo = hoursAgo(48)
  const oneDayAgo = hoursAgo(24)
  const sixHoursAgo = hoursAgo(6)

  const pendingShipments = await Promise.all([
    prisma.shipment.create({
      data: {
        tracking_id: 'BOT-PEND-001',
        order_id: 'ORD-BUY-001',
        transaction_id: 'TXN-BUY-001',
        buyer_id: 'user_2buyer001',
        seller_id: 'user_2seller001',
        status: 'PENDING',
        delivery_address: 'Av. Siempre Viva 123, Ciudad Botanica',
        type: 'PLANTA_VIVA',
        operator_id: operator.id,
      },
    }),
    prisma.shipment.create({
      data: {
        tracking_id: 'BOT-PEND-002',
        order_id: 'ORD-BUY-002',
        transaction_id: 'TXN-BUY-002',
        buyer_id: 'user_2buyer002',
        seller_id: 'user_2seller002',
        status: 'PENDING',
        delivery_address: 'Calle Las Orquideas 456, Sector Norte',
        type: 'INSUMOS',
        operator_id: operator.id,
      },
    }),
    prisma.shipment.create({
      data: {
        tracking_id: 'BOT-PEND-003',
        order_id: 'ORD-BUY-003',
        transaction_id: 'TXN-BUY-003',
        buyer_id: 'user_2buyer003',
        seller_id: 'user_2seller003',
        status: 'PENDING',
        delivery_address: 'Boulevard Los Robles 789, Distrito Floral',
        type: 'FRAGIL',
        operator_id: operator.id,
      },
    }),
    prisma.shipment.create({
      data: {
        tracking_id: 'BOT-PEND-004',
        order_id: 'ORD-BUY-004',
        transaction_id: 'TXN-BUY-004',
        buyer_id: 'user_2buyer004',
        seller_id: 'user_2seller004',
        status: 'PENDING',
        delivery_address: 'Pasaje del Sol 101, Zona Centro',
        type: 'SEMILLAS',
        operator_id: operator.id,
      },
    }),
  ])

  for (const ship of pendingShipments) {
    await prisma.trackingEvent.create({
      data: {
        shipment_id: ship.id,
        status: 'RECIBIDO_EN_ORIGEN',
        timestamp: hoursAgo(1),
      },
    })
  }

  const assignedShipments = await Promise.all([
    prisma.shipment.create({
      data: {
        tracking_id: 'BOT-ASGN-001',
        order_id: 'ORD-BUY-005',
        transaction_id: 'TXN-BUY-005',
        buyer_id: 'user_2buyer005',
        seller_id: 'user_2seller005',
        status: 'ASSIGNED',
        delivery_address: 'Calle Los Pinos 222, Residencial Bosque',
        type: 'PLANTA_VIVA',
        operator_id: operator.id,
        driver_id: realDriverRecord.id,
      },
    }),
    prisma.shipment.create({
      data: {
        tracking_id: 'BOT-ASGN-002',
        order_id: 'ORD-BUY-006',
        transaction_id: 'TXN-BUY-006',
        buyer_id: 'user_2buyer006',
        seller_id: 'user_2seller006',
        status: 'ASSIGNED',
        delivery_address: 'Avenida Palmas 333, Altos del Valle',
        type: 'INSUMOS',
        operator_id: operator.id,
        driver_id: driverAssigned.id,
      },
    }),
    prisma.shipment.create({
      data: {
        tracking_id: 'BOT-ASGN-003',
        order_id: 'ORD-BUY-007',
        transaction_id: 'TXN-BUY-007',
        buyer_id: 'user_2buyer007',
        seller_id: 'user_2seller007',
        status: 'ASSIGNED',
        delivery_address: 'Camino del Vivero 555, La Floresta',
        type: 'FRAGIL',
        operator_id: operator.id,
        driver_id: realDriverRecord.id,
      },
    }),
    prisma.shipment.create({
      data: {
        tracking_id: 'BOT-ASGN-004',
        order_id: 'ORD-BUY-008',
        transaction_id: 'TXN-BUY-008',
        buyer_id: 'user_2buyer008',
        seller_id: 'user_2seller008',
        status: 'ASSIGNED',
        delivery_address: 'Sendero del Jardin 77, Villa Verde',
        type: 'OTROS',
        operator_id: operator.id,
        driver_id: driverAssigned.id,
      },
    }),
  ])

  for (const ship of assignedShipments) {
    await prisma.trackingEvent.create({
      data: {
        shipment_id: ship.id,
        status: 'RECIBIDO_EN_ORIGEN',
        timestamp: oneDayAgo,
      },
    })
  }

  const inTransitShipments = await Promise.all([
    prisma.shipment.create({
      data: {
        tracking_id: 'BOT-TRAN-001',
        order_id: 'ORD-BUY-009',
        transaction_id: 'TXN-BUY-009',
        buyer_id: 'user_2buyer009',
        seller_id: 'user_2seller009',
        status: 'IN_TRANSIT',
        delivery_address: 'Diagonal las Palmeras 111, Barrio del Sol',
        type: 'PLANTA_VIVA',
        operator_id: operator.id,
        driver_id: realDriverRecord.id,
      },
    }),
    prisma.shipment.create({
      data: {
        tracking_id: 'BOT-TRAN-002',
        order_id: 'ORD-BUY-010',
        transaction_id: 'TXN-BUY-010',
        buyer_id: 'user_2buyer010',
        seller_id: 'user_2seller010',
        status: 'IN_TRANSIT',
        delivery_address: 'Callejon de las Flores 234, Villa Jardin',
        type: 'INSUMOS',
        operator_id: operator.id,
        driver_id: driverAssigned.id,
      },
    }),
    prisma.shipment.create({
      data: {
        tracking_id: 'BOT-TRAN-003',
        order_id: 'ORD-BUY-011',
        transaction_id: 'TXN-BUY-011',
        buyer_id: 'user_2buyer011',
        seller_id: 'user_2seller011',
        status: 'IN_TRANSIT',
        delivery_address: 'Ruta del Botanico 890, El Vergel',
        type: 'SEMILLAS',
        operator_id: operator.id,
        driver_id: realDriverRecord.id,
      },
    }),
    prisma.shipment.create({
      data: {
        tracking_id: 'BOT-TRAN-004',
        order_id: 'ORD-BUY-012',
        transaction_id: 'TXN-BUY-012',
        buyer_id: 'user_2buyer012',
        seller_id: 'user_2seller012',
        status: 'IN_TRANSIT',
        delivery_address: 'Pasaje del Helecho 456, Ciudad Jardin',
        type: 'OTROS',
        operator_id: operator.id,
        driver_id: driverAssigned.id,
      },
    }),
  ])

  for (const ship of inTransitShipments) {
    await prisma.trackingEvent.createMany({
      data: [
        { shipment_id: ship.id, status: 'RECIBIDO_EN_ORIGEN', timestamp: twoDaysAgo },
        { shipment_id: ship.id, status: 'EN_TRANSITO', timestamp: sixHoursAgo },
      ],
    })
  }

  const deliveredShipments = await Promise.all([
    prisma.shipment.create({
      data: {
        tracking_id: 'BOT-DELV-001',
        order_id: 'ORD-BUY-013',
        transaction_id: 'TXN-BUY-013',
        buyer_id: 'user_2buyer013',
        seller_id: 'user_2seller013',
        status: 'DELIVERED',
        delivery_address: 'Av. del Curador 100, Centro Botanico',
        type: 'PLANTA_VIVA',
        operator_id: operator.id,
        driver_id: realDriverRecord.id,
        delivered_at: now,
      },
    }),
    prisma.shipment.create({
      data: {
        tracking_id: 'BOT-DELV-002',
        order_id: 'ORD-BUY-014',
        transaction_id: 'TXN-BUY-014',
        buyer_id: 'user_2buyer014',
        seller_id: 'user_2seller014',
        status: 'DELIVERED',
        delivery_address: 'Calle del Especimen 789, Residencial Flora',
        type: 'FRAGIL',
        operator_id: operator.id,
        driver_id: driverAssigned.id,
        delivered_at: oneDayAgo,
      },
    }),
    prisma.shipment.create({
      data: {
        tracking_id: 'BOT-DELV-003',
        order_id: 'ORD-BUY-015',
        transaction_id: 'TXN-BUY-015',
        buyer_id: 'user_2buyer015',
        seller_id: 'user_2seller015',
        status: 'DELIVERED',
        delivery_address: 'Boulevard de los Viveros 321, Sector Raiz',
        type: 'INSUMOS',
        operator_id: operator.id,
        driver_id: realDriverRecord.id,
        delivered_at: sixHoursAgo,
      },
    }),
  ])

  for (const ship of deliveredShipments) {
    await prisma.trackingEvent.createMany({
      data: [
        { shipment_id: ship.id, status: 'RECIBIDO_EN_ORIGEN', timestamp: threeDaysAgo },
        { shipment_id: ship.id, status: 'EN_TRANSITO', timestamp: twoDaysAgo },
        { shipment_id: ship.id, status: 'ENTREGADO', timestamp: ship.delivered_at || now },
      ],
    })
  }

  if (realOperatorId) {
    console.log(`Operador real vinculado: ${opUserId}`)
  } else {
    console.log('Operador de seed usado: user_2opLogistics999')
  }
  if (realDriverId) {
    console.log(`Repartidor real vinculado: ${drvUserId}`)
  } else {
    console.log('Repartidor de seed usado: user_2drvAvail001')
  }

  const total = pendingShipments.length + assignedShipments.length + inTransitShipments.length + deliveredShipments.length
  console.log(`\n${total} envios creados:`)
  console.log(`  ${pendingShipments.length} PENDING`)
  console.log(`  ${assignedShipments.length} ASSIGNED`)
  console.log(`  ${inTransitShipments.length} IN_TRANSIT`)
  console.log(`  ${deliveredShipments.length} DELIVERED`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
