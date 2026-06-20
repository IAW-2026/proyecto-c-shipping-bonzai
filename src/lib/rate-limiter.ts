const MAX_REQUESTS = 60
const WINDOW_MS = 60_000

const hits = new Map<string, number[]>()

export function checkRateLimit(request: Request): boolean {
  const key = request.headers.get('x-shipping-service-key')
    || request.headers.get('x-forwarded-for')
    || 'anonymous'

  const now = Date.now()
  const windowStart = now - WINDOW_MS
  const timestamps = (hits.get(key) || []).filter((t) => t > windowStart)

  if (timestamps.length >= MAX_REQUESTS) return false

  timestamps.push(now)
  hits.set(key, timestamps)
  return true
}
