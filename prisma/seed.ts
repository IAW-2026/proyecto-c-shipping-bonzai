import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL
const adapter = new PrismaPg(new pg.Pool({ connectionString }))
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.trackingEvent.deleteMany()
  await prisma.shipment.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.logisticOperator.deleteMany()

  const operator = await prisma.logisticOperator.create({
    data: {
      clerk_user_id: 'user_2opLogistics999',
      status: 'ACTIVE',
    },
  })

  const driverAvailable = await prisma.driver.create({
    data: { clerk_user_id: 'user_2drvAvail001', status: 'AVAILABLE' }
  })
  const driverAssigned = await prisma.driver.create({
    data: { clerk_user_id: 'user_2drvAssign002', status: 'ASSIGNED' }
  })
  await prisma.driver.create({
    data: { clerk_user_id: 'user_2drvInact003', status: 'INACTIVE' }
  })

  const now = new Date()
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  await prisma.shipment.createMany({
    data: [
      {
        tracking_id: 'TRK-PEND-001',
        order_id: 'ord_buyApp_101',
        transaction_id: 'txn_ord_buyApp_101',
        buyer_id: 'user_2buyer001',
        seller_id: 'user_2seller001',
        status: 'PENDING',
        delivery_address: 'Av. Siempre Viva 123, Ciudad Botanica',
        type: 'PLANTA_VIVA',
        operator_id: operator.id
      },
      {
        tracking_id: 'TRK-PEND-002',
        order_id: 'ord_buyApp_102',
        transaction_id: 'txn_ord_buyApp_102',
        buyer_id: 'user_2buyer002',
        seller_id: 'user_2seller002',
        status: 'PENDING',
        delivery_address: 'Calle Las Orquideas 456, Sector Norte',
        type: 'INSUMOS',
        operator_id: operator.id
      }
    ]
  })

  await prisma.shipment.createMany({
    data: [
      {
        tracking_id: 'TRK-TRANS-001',
        order_id: 'ord_buyApp_201',
        transaction_id: 'txn_ord_buyApp_201',
        buyer_id: 'user_2buyer003',
        seller_id: 'user_2seller003',
        status: 'IN_TRANSIT',
        delivery_address: 'Boulevard Los Robles 789, Distrito Floral',
        type: 'FRAGIL',
        operator_id: operator.id,
        driver_id: driverAssigned.id
      },
      {
        tracking_id: 'TRK-TRANS-002',
        order_id: 'ord_buyApp_202',
        transaction_id: 'txn_ord_buyApp_202',
        buyer_id: 'user_2buyer004',
        seller_id: 'user_2seller004',
        status: 'IN_TRANSIT',
        delivery_address: 'Pasaje del Sol 101, Zona Centro',
        type: 'SEMILLAS',
        operator_id: operator.id,
        driver_id: driverAssigned.id
      }
    ]
  })

  const delivered1 = await prisma.shipment.create({
    data: {
      tracking_id: 'TRK-DELIV-001',
      order_id: 'ord_buyApp_301',
      transaction_id: 'txn_ord_buyApp_301',
      buyer_id: 'user_2buyer005',
      seller_id: 'user_2seller005',
      status: 'DELIVERED',
      delivery_address: 'Calle Los Pinos 222, Residencial Bosque',
      type: 'PLANTA_VIVA',
      operator_id: operator.id,
      driver_id: driverAvailable.id,
      delivered_at: now
    }
  })

  const delivered2 = await prisma.shipment.create({
    data: {
      tracking_id: 'TRK-DELIV-002',
      order_id: 'ord_buyApp_302',
      transaction_id: 'txn_ord_buyApp_302',
      buyer_id: 'user_2buyer006',
      seller_id: 'user_2seller006',
      status: 'DELIVERED',
      delivery_address: 'Avenida Palmas 333, Altos del Valle',
      type: 'INSUMOS',
      operator_id: operator.id,
      driver_id: driverAvailable.id,
      delivered_at: now
    }
  })

  const eventsData = []
  
  for (const ship of [delivered1, delivered2]) {
    eventsData.push(
      { shipment_id: ship.id, status: 'Recibido', timestamp: twoDaysAgo },
      { shipment_id: ship.id, status: 'En camino', timestamp: yesterday },
      { shipment_id: ship.id, status: 'Entregado', timestamp: now }
    )
  }

  await prisma.trackingEvent.createMany({
    data: eventsData
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })