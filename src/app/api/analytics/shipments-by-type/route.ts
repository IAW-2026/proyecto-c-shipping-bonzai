import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyShippingServiceKey } from '@/lib/auth-verify'
import { checkRateLimit } from '@/lib/rate-limiter'
import { analyticsDateFilterSchema } from '@/lib/validations/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!verifyShippingServiceKey(request)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  if (!checkRateLimit(request)) {
    return NextResponse.json({ error: 'TOO_MANY_REQUESTS' }, { status: 429 })
  }

  const url = new URL(request.url)
  const parsed = analyticsDateFilterSchema.safeParse(Object.fromEntries(url.searchParams))
  const filter = parsed.success ? parsed.data : {}

  try {
    const where: Record<string, unknown> = {}

    if (filter.from || filter.to) {
      const dateFilter: Record<string, Date> = {}
      if (filter.from) dateFilter.gte = new Date(filter.from)
      if (filter.to) dateFilter.lte = new Date(filter.to)
      where.created_at = dateFilter
    }

    const byType = await prisma.shipment.groupBy({
      by: ['type'],
      where,
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
