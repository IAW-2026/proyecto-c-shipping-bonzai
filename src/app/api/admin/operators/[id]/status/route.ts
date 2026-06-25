import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyShippingServiceKey } from '@/lib/auth-verify'
import { checkRateLimit } from '@/lib/rate-limiter'
import { adminUpdateUserStatusSchema, uuidParamSchema } from '@/lib/validations/admin'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyShippingServiceKey(request)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  if (!checkRateLimit(request)) {
    return NextResponse.json({ error: 'TOO_MANY_REQUESTS' }, { status: 429 })
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

  if (status !== 'ACTIVE' && status !== 'INACTIVE') {
    return NextResponse.json(
      { error: 'INVALID_STATUS', message: 'Operators only support ACTIVE or INACTIVE' },
      { status: 400 }
    )
  }

  const operator = await prisma.logisticOperator.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json({ data: operator })
}
