import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

const mockedAuth = vi.mocked(auth)
const mockedPrisma = {
  shipment: {
    findUnique: vi.mocked(prisma.shipment.findUnique),
  },
}

function createRequest(trackingId: string): NextRequest {
  return new NextRequest(`http://localhost:3000/api/shipping/${trackingId}`)
}

describe('GET /api/shipping/[trackingId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when user is not authenticated', async () => {
    mockedAuth.mockResolvedValue({ userId: null, sessionClaims: null, redirectToSignIn: vi.fn() } as never)

    const request = createRequest('BOT-TEST123')
    const response = await GET(request, { params: Promise.resolve({ trackingId: 'BOT-TEST123' }) })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('UNAUTHORIZED')
  })

  it('should return 200 when buyer consults their own shipment', async () => {
    const buyerId = 'user_buyer_123'
    mockedAuth.mockResolvedValue({ userId: buyerId, sessionClaims: null, redirectToSignIn: vi.fn() } as never)

    mockedPrisma.shipment.findUnique.mockResolvedValue({
      id: 'shp-001',
      tracking_id: 'BOT-TEST123',
      buyer_id: buyerId,
      seller_id: 'user_seller_456',
      status: 'PENDING',
      delivery_address: 'Jardin Botanico',
      type: 'PLANTA_VIVA',
      created_at: new Date('2024-01-15T10:00:00Z'),
      updated_at: new Date('2024-01-15T10:00:00Z'),
      tracking_events: [
        {
          id: 'evt-001',
          status: 'RECIBIDO_EN_ORIGEN',
          timestamp: new Date('2024-01-15T10:00:00Z'),
        },
      ],
    } as never)

    const request = createRequest('BOT-TEST123')
    const response = await GET(request, { params: Promise.resolve({ trackingId: 'BOT-TEST123' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.trackingId).toBe('BOT-TEST123')
    expect(data.status).toBe('PENDING')
    expect(data.events).toHaveLength(1)
    expect(data.events[0].poeticMessage).toBe('El espécimen ha comenzado su viaje desde el invernadero de origen')
  })

  it('should return 403 when buyer tries to access another buyer shipment', async () => {
    const buyerId = 'user_buyer_123'
    mockedAuth.mockResolvedValue({ userId: buyerId, sessionClaims: null, redirectToSignIn: vi.fn() } as never)

    mockedPrisma.shipment.findUnique.mockResolvedValue({
      id: 'shp-001',
      tracking_id: 'BOT-OTHER',
      buyer_id: 'user_buyer_999',
      seller_id: 'user_seller_456',
      status: 'PENDING',
      delivery_address: 'Jardin Botanico',
      type: 'PLANTA_VIVA',
      created_at: new Date(),
      updated_at: new Date(),
      tracking_events: [],
    } as never)

    const request = createRequest('BOT-OTHER')
    const response = await GET(request, { params: Promise.resolve({ trackingId: 'BOT-OTHER' }) })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('FORBIDDEN')
  })

  it('should return 200 when admin consults any shipment', async () => {
    mockedAuth.mockResolvedValue({
      userId: 'user_admin_123',
      sessionClaims: { roles: ['shipping_admin'] },
      redirectToSignIn: vi.fn(),
    } as never)

    mockedPrisma.shipment.findUnique.mockResolvedValue({
      id: 'shp-001',
      tracking_id: 'BOT-ANY',
      buyer_id: 'user_buyer_999',
      seller_id: 'user_seller_456',
      status: 'IN_TRANSIT',
      delivery_address: 'Jardin Botanico',
      type: 'PLANTA_VIVA',
      created_at: new Date(),
      updated_at: new Date(),
      tracking_events: [
        {
          id: 'evt-001',
          status: 'RECIBIDO_EN_ORIGEN',
          timestamp: new Date(),
        },
        {
          id: 'evt-002',
          status: 'EN_TRANSITO',
          timestamp: new Date(),
        },
      ],
    } as never)

    const request = createRequest('BOT-ANY')
    const response = await GET(request, { params: Promise.resolve({ trackingId: 'BOT-ANY' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.trackingId).toBe('BOT-ANY')
    expect(data.events).toHaveLength(2)
    expect(data.events[1].poeticMessage).toBe('El espécimen navega por los caminos verdes hacia su nuevo hogar')
  })

  it('should return 200 when operator consults any shipment', async () => {
    mockedAuth.mockResolvedValue({
      userId: 'user_op_123',
      sessionClaims: { roles: ['operator_shipping'] },
      redirectToSignIn: vi.fn(),
    } as never)

    mockedPrisma.shipment.findUnique.mockResolvedValue({
      id: 'shp-001',
      tracking_id: 'BOT-OP-TEST',
      buyer_id: 'user_buyer_888',
      seller_id: 'user_seller_456',
      status: 'DELIVERED',
      delivery_address: 'Jardin Botanico',
      type: 'PLANTA_VIVA',
      created_at: new Date(),
      updated_at: new Date(),
      tracking_events: [
        {
          id: 'evt-001',
          status: 'ENTREGADO',
          timestamp: new Date(),
        },
      ],
    } as never)

    const request = createRequest('BOT-OP-TEST')
    const response = await GET(request, { params: Promise.resolve({ trackingId: 'BOT-OP-TEST' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('DELIVERED')
    expect(data.events[0].poeticMessage).toBe('El espécimen ha llegado a destino, completando su ciclo botánico')
  })

  it('should return 404 when trackingId does not exist', async () => {
    const buyerId = 'user_buyer_123'
    mockedAuth.mockResolvedValue({ userId: buyerId, sessionClaims: null, redirectToSignIn: vi.fn() } as never)

    mockedPrisma.shipment.findUnique.mockResolvedValue(null)

    const request = createRequest('BOT-NONEXISTENT')
    const response = await GET(request, { params: Promise.resolve({ trackingId: 'BOT-NONEXISTENT' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('NOT_FOUND')
  })

  it('should return 400 when trackingId is empty', async () => {
    const buyerId = 'user_buyer_123'
    mockedAuth.mockResolvedValue({ userId: buyerId, sessionClaims: null, redirectToSignIn: vi.fn() } as never)

    const request = createRequest('')
    const response = await GET(request, { params: Promise.resolve({ trackingId: '' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('INVALID_TRACKING_ID')
  })

  it('should return default poetic message for unknown status', async () => {
    const buyerId = 'user_buyer_123'
    mockedAuth.mockResolvedValue({ userId: buyerId, sessionClaims: null, redirectToSignIn: vi.fn() } as never)

    mockedPrisma.shipment.findUnique.mockResolvedValue({
      id: 'shp-001',
      tracking_id: 'BOT-UNKNOWN',
      buyer_id: buyerId,
      seller_id: 'user_seller_456',
      status: 'PENDING',
      delivery_address: 'Jardin Botanico',
      type: 'PLANTA_VIVA',
      created_at: new Date(),
      updated_at: new Date(),
      tracking_events: [
        {
          id: 'evt-001',
          status: 'ESTADO_DESCONOCIDO',
          timestamp: new Date(),
        },
      ],
    } as never)

    const request = createRequest('BOT-UNKNOWN')
    const response = await GET(request, { params: Promise.resolve({ trackingId: 'BOT-UNKNOWN' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.events[0].poeticMessage).toBe('El espécimen registra un nuevo capítulo en su diario de tránsito')
  })
})
