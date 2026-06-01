import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL
const adapter = new PrismaPg(new pg.Pool({ connectionString }))
const prisma = new PrismaClient({ adapter })

async function main() {
  const realDriver = await prisma.driver.findFirst({
    where: {
      NOT: {
        clerk_user_id: {
          in: ['user_2drvAvail001', 'user_2drvAssign002', 'user_2drvInact003']
        }
      }
    },
    orderBy: { created_at: 'desc' }
  })

  if (!realDriver) {
    console.log('No se encontró un driver real (creado por lazy sync).')
    console.log('Asegurate de haber entrado a /driver con tu usuario de prueba primero.')
    process.exit(1)
  }

  console.log(`Driver encontrado: ${realDriver.clerk_user_id} (id: ${realDriver.id})`)

  const pendingShipment = await prisma.shipment.findFirst({
    where: {
      status: 'PENDING',
      driver_id: null
    }
  })

  if (!pendingShipment) {
    console.log('No hay envíos PENDING sin driver asignado.')
    process.exit(1)
  }

  console.log(`Asignando envío ${pendingShipment.tracking_id} al driver...`)

  const updated = await prisma.shipment.update({
    where: { id: pendingShipment.id },
    data: {
      driver_id: realDriver.id,
      status: 'PENDING'
    }
  })

  console.log(`✅ Envío ${updated.tracking_id} asignado a driver ${realDriver.clerk_user_id}`)
  console.log('Ahora podés navegar a /driver y ver el envío en tu bitácora.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
