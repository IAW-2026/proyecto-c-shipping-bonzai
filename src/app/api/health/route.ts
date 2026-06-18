import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'healthy', database: 'connected', version: '2.0.0' })
  } catch {
    return NextResponse.json(
      { status: 'unhealthy', database: 'disconnected', version: '2.0.0' },
      { status: 500 }
    )
  }
}
