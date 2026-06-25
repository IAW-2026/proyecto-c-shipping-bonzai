import { NextResponse } from 'next/server'
import { getAvailableDrivers } from '@/app/operator/dashboard/actions'

export async function GET() {
  const drivers = await getAvailableDrivers()
  return NextResponse.json({ drivers })
}