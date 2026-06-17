import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyShippingServiceKey } from '@/lib/auth-verify'
import { adminUpdateUserStatusSchema, uuidParamSchema } from '@/lib/validations/admin'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyShippingServiceKey(request)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { id } = await params
  const parsedId = uuidParamSchema.safeParse(id)
  if (!parsedId.success) {
    return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })
  }

  const body = await request.json()
  const parsed = adminUpdateUserStatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_BODY', details: parsed.error.flatten() }, { status: 400 })
  }

  const { status } = parsed.data

  const STATUS_MAP: Record<string, 'AVAILABLE' | 'INACTIVE' | 'SUSPENDED'> = {
    ACTIVE: 'AVAILABLE',
    AVAILABLE: 'AVAILABLE',
    INACTIVE: 'INACTIVE',
    SUSPENDED: 'SUSPENDED',
  }

  const finalStatus = STATUS_MAP[status]

  const driver = await prisma.driver.update({
    where: { id },
    data: { status: finalStatus },
  })

  return NextResponse.json({ data: driver })
}
