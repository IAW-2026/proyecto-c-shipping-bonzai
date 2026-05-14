import { NextResponse } from 'next/server'
import { getAvailableDrivers } from '@/app/admin/shipments/actions'

export async function GET() {
  const drivers = await getAvailableDrivers()
  return NextResponse.json({ drivers })
}