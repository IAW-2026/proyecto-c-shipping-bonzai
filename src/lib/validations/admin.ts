import { z } from 'zod'

const clerkIdRegex = /^user_[a-zA-Z0-9]+$/

export const adminShipmentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(50),
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']).optional(),
  seller_id: z.string().regex(clerkIdRegex).optional(),
  q: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

export const adminPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(50),
})

export const adminStaffQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(50),
  q: z.string().optional(),
})

export const adminUpdateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'AVAILABLE']),
})

export const uuidParamSchema = z.string().uuid()

export const analyticsDateFilterSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  granularity: z.enum(['day', 'week', 'month']).optional(),
})
