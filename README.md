# Shipping App | The Botanical Curator

> *"The Living Archive: Where every shipment is a curated specimen in transit."*

## Descripcion

La **Shipping App** es el pilar logistico del ecosistema botanico. Su responsabilidad es gestionar el ciclo de vida completo de los envios, desde plantas vivas y herramientas hasta insumos especializados, asegurando que cada especimen llegue desde el vivero hasta su destino final con la precision de un archivo viviente.

## Deploy

[URL de Vercel](https://shipping-app.vercel.app) *(placeholder)*

## Acceso por Roles

La autenticacion se gestiona mediante **Clerk**. Segun tu rol, accedes a funcionalidades distintas:

### Operador Logistico (Admin)

- Panel `/operator/dashboard` para gestion completa de envios
- Asignacion de repartidores a envios pendientes
- Filtrado por estado y busqueda por tracking ID

### Repartidor (Driver)

- Vista optimizada para dispositivos moviles
- Confirmacion de entregas en tiempo real

## Stack Tecnologico

| Tecnologia | Uso |
|-----------|-----|
| **Next.js 16** (App Router) | Framework principal con Server Components |
| **TypeScript** | Tipado estatico para integridad de datos |
| **Tailwind CSS** | Sistema de diseno "The Botanical Curator" |
| **Prisma ORM** | Modelado y consultas a PostgreSQL |
| **PostgreSQL** | Base de datos relacional para envios y eventos |
| **Clerk** | Autenticacion y autorizacion por roles |

## Instalacion Local

```bash
npm install
npx prisma generate
npm run dev
```

## Variables de Entorno

Copia `.env.example` a `.env.local` y configura:

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

## Caracteristicas Destacadas

- **Paginacion y busqueda** gestionadas exclusivamente por parametros de URL (`?page=1&search=BOT-...`)
- **Diseno accesible** siguiendo principios POUR (Perceptible, Operable, Understandable, Robust)
- **Server Components y Server Actions** para maxima integridad de datos
- **Sincronizacion lazy** de perfiles de usuario desde Clerk hacia Prisma

## Responsable

**Arista Valentin**