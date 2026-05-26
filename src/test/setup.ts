import { vi } from 'vitest'

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    shipment: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    trackingEvent: {
      create: vi.fn(),
    },
  },
}))
