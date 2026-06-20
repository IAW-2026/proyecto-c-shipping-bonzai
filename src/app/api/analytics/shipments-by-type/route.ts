import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyShippingServiceKey } from '@/lib/auth-verify'
import { checkRateLimit } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!verifyShippingServiceKey(request)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  if (!checkRateLimit(request)) {
    return NextResponse.json({ error: 'TOO_MANY_REQUESTS' }, { status: 429 })
  }

  try {
    const byType = await prisma.shipment.groupBy({
      by: ['type'],
      _count: { _all: true },
    })

    const data = byType.map((entry) => ({
      type: entry.type,
      count: entry._count._all,
    }))

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: [] })
  }
}
