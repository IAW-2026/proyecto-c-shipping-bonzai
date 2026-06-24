# Portal de Envíos Bonzai — The Botanical Curator

## Link al Deploy de Producción

https://proyecto-c-shipping-bonzai.vercel.app

## Usuarios de Prueba

| Rol | Email | Contraseña |
|---|---|---|
| Operador | operator+clerk_test@iaw.com | iawuser# |
| Repartidor (Driver) | driver+clerk_test@iaw.com | iawuser# |
| Admin | admin+clerk_test@iaw.com | iawuser# |
| Sin rol (onboarding) | freeship1+clerk_test@iaw.com | iawuser# |
| Sin rol (onboarding) | freeship2+clerk_test@iaw.com | iawuser# |

## Instrucciones de Evaluación

### 1. Operador asigna un ejemplar a un repartidor

1. Inicia sesión con **operator+clerk_test@iaw.com** en la pagina de sign-in.
2. Navega a **Panel > Resumen de envíos** (sidebar izquierdo).
3. Busca un envío en estado **"Pendiente"** usando los filtros.
4. Haz clic en la tarjeta del envío para abrir el drawer lateral.
5. Haz clic en el botón **"Asignar Repartidor"**.
6. Selecciona un repartidor disponible de la lista.
7. El envío pasa de PENDING a ASSIGNED. El repartidor ahora lo vera en su bitácora.

### 2. Repartidor confirma retiro y entrega

1. Cierra sesión e inicia sesión con **driver+clerk_test@iaw.com**.
2. Navega a la vista del repartidor (la landing page redirige automaticamente).
3. Veras los envíos asignados en estado **"Asignado"** en el panel izquierdo.
4. Selecciona un envío y haz clic en **"Marcar como retirado"**. El estado cambia de ASSIGNED a IN_TRANSIT. Aparece un nuevo evento en el Diario de tránsito.
5. Haz clic en **"Marcar como entregado"**. El estado cambia a DELIVERED, se registra `delivered_at` y se notifica automaticamente a Payments App.

### 3. Visualizar seguimiento poético

1. Sin necesidad de login, navega a `/shipping/{trackingId}` (usa cualquier tracking ID del seed, ej: BOT-DELV-001).
2. Verás el **Diario de tránsito** con el historial completo del especimen.
3. Cada evento muestra un mensaje poético que narra el viaje botánico: "El especimen ha comenzado su viaje desde el invernadero de origen", "El especimen navega por los caminos verdes hacia su nuevo hogar", etc.

### 4. Admin asigna roles a nuevos usuarios (onboarding)

1. Inicia sesion con **admin+clerk_test@iaw.com**.
2. Navega a **Nuevos Especimenes** en el sidebar.
3. Veras una lista de usuarios de Clerk sin rol asignado (freeship1 y freeship2).
4. Para cada uno, asigna un rol (`operator_shipping`, `driver_shipping`) y haz clic en **Aprobar**.
5. El usuario ahora puede ingresar a la app con su nuevo rol y el lazy sync creara su registro local automaticamente.

### 5. Admin supervisa

1. Inicia sesión con **admin+clerk_test@iaw.com**.
2. Desde el sidebar accede a:
   - **Nuevos Especimenes**: onboarding de usuarios con roles pendientes.
   - **Jardineros**: gestion de repartidores y operadores (suspender/reactivar).
   - **Resumen de envíos**: dashboard completo con filtros y paginación.
   - **Vista del Repartidor**: modo supervisor en `/driver`, solo lectura.

## Descripción del Proyecto

The Botanical Curator transforma la logistica de envíos en una experiencia narrativa de alto nivel editorial. En lugar de códigos de seguimiento frios, cada producto es tratado como un **especimen botánico** que transita un ciclo de vida documentado poeticamente en su Diario de tránsito: desde el invernadero de origen hasta su destino final.

La plataforma gestiona el ciclo completo del envío a través de tres roles: **Operadores** logísticos que reciben y asignan pedidos, **Repartidores** que transportan los especimenes confirmando retiro y entrega, y **Administradores** que supervisan el ecosistema completo gestionando el onboarding de nuevos usuarios y el estado de jardineros y operadores.

La aplicación se comunica con dos servicios externos en tiempo real: la **Seller App**, a la que notifica el tracking ID apenas se crea un envío (via POST con `x-service-key`), y la **Payments App**, a la que informa cuando un especimen es entregado exitosamente (via POST con `x-service-key`). Ambas integraciones son M2M server-to-server con autenticación dual: cookies de Clerk para usuarios navegadores y JWT Bearer via jose + JWKS remoto para llamadas entre servicios.

Tecnicamente es una aplicación Next.js 16 con App Router, Prisma sobre PostgreSQL, autenticacion Clerk con roles personalizados (`operator_shipping`, `driver_shipping`, `shipping_admin`), y lazy sync que crea automaticamente los registros locales de Driver y Operator cuando un usuario con el rol correspondiente inicia sesión por primera vez.

## Notas para la Corrección

- **Sistema de diseño**: Paleta de colores Bone (#faf9f4) como fondo, Deep Evergreen (#03271a) como color primario de marca, y Moss (#526347) para textos secundarios. Tipografia: Newsreader (serif) para títulos y Manrope (sans) para cuerpo. Sin bordes de 1px — se utilizan sombras suaves y fondos contrastantes para delimitar elementos. Se implementó una estética de "bitácora botánica curada".
- **Integración M2M real**: El endpoint `POST /api/shipping/dispatch` notifica automaticamente a la Seller App enviando el `trackingId` a `{SELLER_SERVICE_URL}/api/orders/{orderRef}/tracking`. Al confirmar entrega, la Server Action `confirmDelivery` envia una notificación a `{PAYMENTS_API_URL}/api/payments/{order_id}/delivered` con el header `x-service-key`. Ambas llamadas usan `try/catch` independiente de la transacción local de Prisma para garantizar que el flujo principal nunca se bloquee por fallos externos (eventual consistency).
- **Idioma de la UI**: La interfaz de usuario esta 100% en espanol con locale `es-AR` configurado en el tag `<html lang="es-AR">`. Las fechas usan `Intl.DateTimeFormat` con formato DD/MM/YYYY. El código (variables, funciones, enums de Prisma, rutas de API, logs de consola) se mantiene en inglés por estándares de ingeniería. Las traducciones de enums estan centralizadas en `src/lib/translations.ts`.
- **Datos de prueba**: El seed (`prisma/seed.ts`) genera 15 envíos distribuidos equitativamente entre los estados PENDING (4), ASSIGNED (4), IN_TRANSIT (4) y DELIVERED (3). Cada envío tiene su `transaction_id` y una línea de tiempo de `TrackingEvent` coherente con la narrativa del Diario de tránsito. El seed detecta automaticamente si hay usuarios reales creados por lazy sync para vincular los envíos a las cuentas de Clerk de prueba. Para el testeo del flujo de onboarding se incluyen dos usuarios sin rol (`freeship1+clerk_test@iaw.com` y `freeship2+clerk_test@iaw.com`) con verificación de email desactivada para agilizar el acceso.
- **Etapa 3 (pendiente)**: Integración de IA generativa para enriquecer la narrativa botánica del Diario de Tránsito con mensajes poéticos personalizados por tipo de espécimen, destino y estación del año. Queda planificada para la siguiente fase del proyecto.
