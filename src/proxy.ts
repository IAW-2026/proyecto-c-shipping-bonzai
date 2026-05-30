import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const VALID_SHIPPING_ROLES = ['operator_shipping', 'driver_shipping', 'shipping_admin']

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/unauthorized(.*)',
  '/api/webhooks(.*)',
  '/api/shipping/dispatch',
  '/api/shipping/(.*)',
  '/test-dispatch',
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isOperatorRoute = createRouteMatcher(['/operator(.*)'])
const isDriverRoute = createRouteMatcher(['/driver(.*)'])

function getRolesFromClaims(sessionClaims: unknown): string[] {
  const claims = sessionClaims as {
    roles?: string | string[]
    publicMetadata?: { roles?: string | string[] }
  } | null
  const raw = claims?.roles || claims?.publicMetadata?.roles || []
  return Array.isArray(raw) ? raw : [raw]
}

function buildUnauthorizedUrl(req: Request, reason: 'pending' | 'wrong-role') {
  return NextResponse.redirect(new URL(`/unauthorized?reason=${reason}`, req.url))
}

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return

  const { userId, sessionClaims } = await auth()

  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  const roles = getRolesFromClaims(sessionClaims)
  const hasShippingRole = roles.some((r) => VALID_SHIPPING_ROLES.includes(r))

  if (!hasShippingRole) {
    return buildUnauthorizedUrl(req, 'pending')
  }

  if (isAdminRoute(req)) {
    if (!roles.includes('shipping_admin')) {
      return buildUnauthorizedUrl(req, 'wrong-role')
    }
    return
  }

  if (isOperatorRoute(req)) {
    if (!roles.includes('operator_shipping') && !roles.includes('shipping_admin')) {
      return buildUnauthorizedUrl(req, 'wrong-role')
    }
    return
  }

  if (isDriverRoute(req)) {
    if (!roles.includes('driver_shipping') && !roles.includes('shipping_admin')) {
      return buildUnauthorizedUrl(req, 'wrong-role')
    }
    return
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:css|js|png|jpg|ico|svg)).*)'],
}