import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import * as jose from 'jose'

vi.mock('jose', async () => {
  return {
    createRemoteJWKSet: vi.fn(() => ({})),
    jwtVerify: vi.fn(),
  }
})

const mockedJwtVerify = vi.mocked(jose.jwtVerify)

const mockedAuth = vi.mocked(auth)
const mockedPrisma = {
  shipment: {
    findFirst: vi.mocked(prisma.shipment.findFirst),
    create: vi.mocked(prisma.shipment.create),
  },
  trackingEvent: {
    create: vi.mocked(prisma.trackingEvent.create),
  },
}

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/shipping/dispatch', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/shipping/dispatch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when user is not authenticated', async () => {
    mockedAuth.mockResolvedValue({ userId: null, sessionClaims: null, redirectToSignIn: vi.fn() } as never)

    const request = createRequest({
      orderRef: 'ORD-001',
      transactionId: 'txn-001',
      sellerId: 'user_123',
      buyerId: 'user_456',
      deliveryAddress: 'Calle 123',
      type: 'PLANTA_VIVA',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('UNAUTHORIZED')
  })

  it('should return 400 when data is invalid (Zod validation fails)', async () => {
    mockedAuth.mockResolvedValue({ userId: 'user_123', sessionClaims: null, redirectToSignIn: vi.fn() } as never)

    const request = createRequest({
      orderRef: '',
      transactionId: '',
      sellerId: 'invalid-id',
      buyerId: 'also-invalid',
      deliveryAddress: '',
      type: 'INVALID_TYPE',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('INVALID_DATA')
  })

  it('should return 403 when sellerId does not match authenticated user', async () => {
    mockedAuth.mockResolvedValue({ userId: 'user_999', sessionClaims: null, redirectToSignIn: vi.fn() } as never)

    const request = createRequest({
      orderRef: 'ORD-001',
      transactionId: 'txn-001',
      sellerId: 'user_123',
      buyerId: 'user_456',
      deliveryAddress: 'Calle 123',
      type: 'PLANTA_VIVA',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('FORBIDDEN')
  })

  it('should return 200 with ALREADY_EXISTS when shipment already exists with same data', async () => {
    mockedAuth.mockResolvedValue({ userId: 'user_123', sessionClaims: null, redirectToSignIn: vi.fn() } as never)
    mockedPrisma.shipment.findFirst.mockResolvedValue({
      id: 'shp-001',
      tracking_id: 'BOT-ABC12345',
      order_id: 'ORD-001',
      seller_id: 'user_123',
      buyer_id: 'user_456',
      delivery_address: 'Calle 123',
      type: 'PLANTA_VIVA',
      status: 'PENDING',
    } as never)

    const request = createRequest({
      orderRef: 'ORD-001',
      transactionId: 'txn-001',
      sellerId: 'user_123',
      buyerId: 'user_456',
      deliveryAddress: 'Calle 123',
      type: 'PLANTA_VIVA',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('ALREADY_EXISTS')
    expect(data.trackingId).toBe('BOT-ABC12345')
  })

  it('should return 409 when shipment exists with different data', async () => {
    mockedAuth.mockResolvedValue({ userId: 'user_123', sessionClaims: null, redirectToSignIn: vi.fn() } as never)
    mockedPrisma.shipment.findFirst.mockResolvedValue({
      id: 'shp-001',
      tracking_id: 'BOT-ABC12345',
      order_id: 'ORD-001',
      seller_id: 'user_123',
      buyer_id: 'user_456',
      delivery_address: 'Calle DIFERENTE',
      type: 'INSUMOS',
      status: 'PENDING',
    } as never)

    const request = createRequest({
      orderRef: 'ORD-001',
      transactionId: 'txn-001',
      sellerId: 'user_123',
      buyerId: 'user_456',
      deliveryAddress: 'Calle 123',
      type: 'PLANTA_VIVA',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('CONFLICT')
  })

  it('should return 201 with CREATED when shipment is created successfully', async () => {
    mockedAuth.mockResolvedValue({ userId: 'user_123', sessionClaims: null, redirectToSignIn: vi.fn() } as never)
    mockedPrisma.shipment.findFirst.mockResolvedValue(null)
    mockedPrisma.shipment.create.mockResolvedValue({
      id: 'shp-new',
      tracking_id: 'BOT-NEW12345',
      order_id: 'ORD-NEW',
      transaction_id: 'txn-new',
      seller_id: 'user_123',
      buyer_id: 'user_456',
      delivery_address: 'Calle 123',
      type: 'PLANTA_VIVA',
      status: 'PENDING',
    } as never)
    mockedPrisma.trackingEvent.create.mockResolvedValue({ id: 'evt-001' } as never)

    const request = createRequest({
      orderRef: 'ORD-NEW',
      transactionId: 'txn-new',
      sellerId: 'user_123',
      buyerId: 'user_456',
      deliveryAddress: 'Calle 123',
      type: 'PLANTA_VIVA',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.status).toBe('CREATED')
    expect(data.trackingId).toMatch(/^BOT-/)
    expect(mockedPrisma.trackingEvent.create).toHaveBeenCalledTimes(1)
  })

  it('should return 500 when tracking ID generation fails after 3 attempts', async () => {
    mockedAuth.mockResolvedValue({ userId: 'user_123', sessionClaims: null, redirectToSignIn: vi.fn() } as never)
    mockedPrisma.shipment.findFirst.mockResolvedValue(null)

    const prismaError = { code: 'P2002', message: 'Unique constraint failed' }
    mockedPrisma.shipment.create.mockRejectedValue(prismaError)

    const request = createRequest({
      orderRef: 'ORD-FAIL',
      transactionId: 'txn-fail',
      sellerId: 'user_123',
      buyerId: 'user_456',
      deliveryAddress: 'Calle 123',
      type: 'PLANTA_VIVA',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('TRACKING_GENERATION_FAILED')
    expect(mockedPrisma.shipment.create).toHaveBeenCalledTimes(3)
  })

  it('should authenticate via Bearer JWT and create shipment when cookie auth is absent', async () => {
    mockedAuth.mockResolvedValue({ userId: null, sessionClaims: null, redirectToSignIn: vi.fn() } as never)
    mockedJwtVerify.mockResolvedValue({
      payload: { sub: 'user_123' },
    } as never)
    mockedPrisma.shipment.findFirst.mockResolvedValue(null)
    mockedPrisma.shipment.create.mockResolvedValue({
      id: 'shp-jwt',
      tracking_id: 'BOT-JWT12345',
      order_id: 'ORD-JWT',
      transaction_id: 'txn-jwt',
      seller_id: 'user_123',
      buyer_id: 'user_456',
      delivery_address: 'Calle JWT',
      type: 'PLANTA_VIVA',
      status: 'PENDING',
    } as never)
    mockedPrisma.trackingEvent.create.mockResolvedValue({ id: 'evt-jwt' } as never)

    const request = new NextRequest('http://localhost:3000/api/shipping/dispatch', {
      method: 'POST',
      body: JSON.stringify({
        orderRef: 'ORD-JWT',
        transactionId: 'txn-jwt',
        sellerId: 'user_123',
        buyerId: 'user_456',
        deliveryAddress: 'Calle JWT',
        type: 'PLANTA_VIVA',
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-jwt-token',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.status).toBe('CREATED')
    expect(data.trackingId).toMatch(/^BOT-/)
    expect(mockedJwtVerify).toHaveBeenCalledTimes(1)
  })
})
