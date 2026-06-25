'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Leaf, Send, RotateCcw, AlertCircle, CheckCircle, XCircle, ShieldAlert } from 'lucide-react'

const SHIPMENT_TYPES = [
  { value: 'PLANTA_VIVA', label: 'Planta Viva' },
  { value: 'INSUMOS', label: 'Insumos' },
  { value: 'FRAGIL', label: 'Fragil' },
  { value: 'SEMILLAS', label: 'Semillas' },
  { value: 'OTROS', label: 'Otros' },
]

export function DispatchTestForm() {
  const { user, isLoaded } = useUser()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    status: number
    data: unknown
    type: 'success' | 'error'
  } | null>(null)
  const [formData, setFormData] = useState({
    orderRef: `ORD-${Date.now()}`,
    transactionId: `txn-${Date.now()}`,
    buyerId: 'user_456',
    deliveryAddress: 'Jardin Botanico, Calle 45',
    type: 'PLANTA_VIVA',
  })

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin">
          <Leaf size={24} className="text-secondary" strokeWidth={1.5} />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center">
        <AlertCircle size={40} className="text-secondary mx-auto mb-4" strokeWidth={1.5} />
        <h2 className="font-display text-2xl text-primary mb-2">
          Autenticación Requerida
        </h2>
        <p className="font-sans text-sm text-secondary">
          Debes iniciar sesión para probar el endpoint de dispatch.
        </p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/shipping/dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderRef: formData.orderRef,
          transactionId: formData.transactionId,
          sellerId: user.id,
          buyerId: formData.buyerId,
          deliveryAddress: formData.deliveryAddress,
          type: formData.type,
        }),
      })

      const data = await response.json()
      setResult({
        status: response.status,
        data,
        type: response.ok ? 'success' : 'error',
      })
    } catch (error) {
      setResult({
        status: 0,
        data: { error: 'NETWORK_ERROR', message: String(error) },
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      orderRef: `ORD-${Date.now()}`,
      transactionId: `txn-${Date.now()}`,
      buyerId: 'user_456',
      deliveryAddress: 'Jardin Botanico, Calle 45',
      type: 'PLANTA_VIVA',
    })
    setResult(null)
  }

  const handleInvalidTest = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/shipping/dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderRef: '',
          transactionId: '',
          sellerId: 'invalid-id',
          buyerId: '',
          deliveryAddress: '',
          type: 'INVALID_TYPE',
        }),
      })

      const data = await response.json()
      setResult({
        status: response.status,
        data,
        type: response.ok ? 'success' : 'error',
      })
    } catch (error) {
      setResult({
        status: 0,
        data: { error: 'NETWORK_ERROR', message: String(error) },
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: number) => {
    if (status === 201) return 'bg-status-green text-status-green-text'
    if (status === 200) return 'bg-status-blue text-status-blue-text'
    if (status === 409) return 'bg-status-amber text-status-amber-text'
    return 'bg-red-50 text-red-700'
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-surface-low rounded-full flex items-center justify-center">
            <Send size={18} className="text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-display text-xl text-primary">Nuevo Envío</h2>
            <p className="font-sans text-xs text-secondary">
              ID del Vendedor: {user.id}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block font-sans text-xs text-secondary uppercase tracking-wider mb-1.5">
                Referencia de Pedido
              </label>
              <input
                type="text"
                value={formData.orderRef}
                onChange={(e) => setFormData({ ...formData, orderRef: e.target.value })}
                className="w-full h-11 bg-surface-low rounded-xl px-4 font-sans text-sm text-primary border-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="block font-sans text-xs text-secondary uppercase tracking-wider mb-1.5">
                ID de Transacción
              </label>
              <input
                type="text"
                value={formData.transactionId}
                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                className="w-full h-11 bg-surface-low rounded-xl px-4 font-sans text-sm text-primary border-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block font-sans text-xs text-secondary uppercase tracking-wider mb-1.5">
                ID del Comprador
              </label>
              <input
                type="text"
                value={formData.buyerId}
                onChange={(e) => setFormData({ ...formData, buyerId: e.target.value })}
                className="w-full h-11 bg-surface-low rounded-xl px-4 font-sans text-sm text-primary border-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-xs text-secondary uppercase tracking-wider mb-1.5">
              Dirección de Entrega
            </label>
            <input
              type="text"
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
              className="w-full h-11 bg-surface-low rounded-xl px-4 font-sans text-sm text-primary border-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div>
            <label className="block font-sans text-xs text-secondary uppercase tracking-wider mb-1.5">
              Tipo de Envío
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full h-11 bg-surface-low rounded-xl px-4 font-sans text-sm text-primary border-none focus:ring-2 focus:ring-primary/20"
            >
              {SHIPMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-sans text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RotateCcw size={16} className="animate-spin" strokeWidth={1.5} />
                  Procesando...
                </>
              ) : (
                <>
                  <Send size={16} strokeWidth={1.5} />
                  Crear Envío
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="h-11 px-4 border border-outline-ghost hover:bg-surface-low text-primary rounded-xl font-sans text-sm transition-colors"
            >
              Restablecer
            </button>
            <button
              type="button"
              onClick={handleInvalidTest}
              disabled={loading}
              className="h-11 px-4 border border-outline-ghost hover:bg-red-50 text-red-600 rounded-xl font-sans text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <ShieldAlert size={16} strokeWidth={1.5} />
              Probar Validación Zod
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className={`rounded-2xl p-6 ${getStatusColor(result.status)}`}>
          <div className="flex items-center gap-3 mb-4">
            {result.type === 'success' ? (
              <CheckCircle size={20} strokeWidth={1.5} />
            ) : (
              <XCircle size={20} strokeWidth={1.5} />
            )}
            <div>
              <p className="font-sans text-sm font-medium">
                Estado: {result.status || 'Error de Red'}
              </p>
              <p className="font-sans text-xs opacity-70">
                {result.type === 'success' ? 'Solicitud exitosa' : 'Solicitud fallida'}
              </p>
            </div>
          </div>
          <pre className="bg-white/50 rounded-xl p-4 font-mono text-xs overflow-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}

      <div className="bg-surface-container rounded-2xl p-6">
        <h3 className="font-display text-lg text-primary mb-3">Instrucciones de Test</h3>
        <ul className="space-y-2 font-sans text-sm text-secondary">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
            <span><strong>Creación:</strong> Click "Crear Envío" con datos nuevos → espera status 201 CREATED</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
            <span><strong>Idempotencia:</strong> Click de nuevo con el mismo OrderRef → espera status 200 ALREADY_EXISTS</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
            <span><strong>Conflicto:</strong> Cambia la dirección o tipo, mantén el mismo OrderRef → espera status 409 CONFLICT</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
            <span><strong>Validación:</strong> Click "Probar Validación Zod" → envía datos inválidos → espera status 400 INVALID_DATA</span>
          </li>
        </ul>
      </div>
    </div>
  )
}