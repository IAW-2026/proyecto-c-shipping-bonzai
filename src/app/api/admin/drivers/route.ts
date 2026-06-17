import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyShippingServiceKey } from '@/lib/auth-verify'
import { adminPaginationSchema } from '@/lib/validations/admin'
import type { PaginatedResponse } from '@/lib/types/api'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!verifyShippingServiceKey(request)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const url = new URL(request.url)
  const parsed = adminPaginationSchema.safeParse(Object.fromEntries(url.searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_PARAMS', details: parsed.error.flatten() }, { status: 400 })
  }

  const { page, limit } = parsed.data

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
    }),
    prisma.driver.count(),
  ])

  const response: PaginatedResponse<typeof drivers[number]> = {
    data: drivers,
    meta: {
      total_records: total,
      current_page: page,
      total_pages: Math.ceil(total / limit),
      limit,
    },
  }

  return NextResponse.json(response)
}
