import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth()
    console.log('UserId:', userId)
    console.log('SessionClaims:', JSON.stringify(sessionClaims, null, 2))
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
    const claims = sessionClaims as { roles?: string[] } | null
    const roles = claims?.roles || []
    if (!roles.includes('shipping_admin')) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }
  }
  if (!isPublicRoute(req)) auth.protect()
})

export const config = {
  matcher: ['/((?!_next|[^w]*\\.(?:css|js|png|jpg|ico|svg)).*)'],
}