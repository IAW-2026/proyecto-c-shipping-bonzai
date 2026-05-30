import { auth } from '@clerk/nextjs/server'
import * as jose from 'jose'

function getRolesFromClaims(sessionClaims: unknown): string[] {
  const claims = sessionClaims as {
    roles?: string | string[]
    publicMetadata?: { roles?: string | string[] }
  } | null
  const raw = claims?.roles || claims?.publicMetadata?.roles || []
  return Array.isArray(raw) ? raw : [raw]
}

const JWKS = jose.createRemoteJWKSet(
  new URL(`https://${process.env.CLERK_DOMAIN}/.well-known/jwks.json`)
)

export async function verifyRequestAuth(request: Request) {
  const clerkAuth = await auth()
  if (clerkAuth.userId) {
    const roles = getRolesFromClaims(clerkAuth.sessionClaims)
    return { userId: clerkAuth.userId, roles }
  }

  const bearer = request.headers.get('Authorization') ?? ''
  const token = bearer.replace('Bearer ', '').trim()

  if (!token) {
    return { userId: null, roles: [] }
  }

  try {
    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: `https://${process.env.CLERK_DOMAIN}`,
      clockTolerance: 60,
    })
    const userId = payload.sub as string | undefined
    const roles = getRolesFromClaims(payload)
    return { userId: userId ?? null, roles }
  } catch {
    return { userId: null, roles: [] }
  }
}
