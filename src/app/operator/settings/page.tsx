import { redirect } from 'next/navigation'
import { getLocalProfile, isAdmin } from '@/lib/auth-helpers'
import { auth } from '@clerk/nextjs/server'
import { User, Shield, Wifi, WifiOff } from 'lucide-react'

import { OPERATOR_STATUS_LABELS } from '@/lib/translations'

export default async function SettingsPage() {
  const profile = await getLocalProfile()
  const admin = await isAdmin()
  if (!admin && (!profile || !profile.isActive)) {
    redirect('/unauthorized?reason=pending')
  }

  const { userId } = await auth()
  const sellerConfigured = !!process.env.SELLER_SERVICE_URL
  const paymentsConfigured = !!process.env.PAYMENTS_API_URL

  return (
    <main className="p-12 pb-32">
      <header className="mb-12">
        <span className="font-sans text-[11px] uppercase tracking-widest text-secondary">
          Configuración
        </span>
        <h1 className="font-display text-5xl md:text-6xl mt-2 text-primary">
          Configuración y Perfil
        </h1>
        <p className="font-sans text-sm text-secondary mt-3">
          Cuenta del operador y configuración del sistema.
        </p>
      </header>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-surface-high rounded-xl border border-outline-ghost p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-display text-xl text-primary">Perfil del Operador</h3>
              <p className="font-sans text-xs text-secondary">Detalles de tu cuenta</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="font-sans text-sm text-secondary">Clerk ID</span>
              <span className="font-sans text-sm text-primary">{userId}</span>
            </div>
            {profile?.profile && (
              <>
                <div className="flex justify-between items-center py-2">
                  <span className="font-sans text-sm text-secondary">Rol</span>
                  <span className="font-sans text-sm text-primary">
                    {admin ? 'Administrador' : 'Operador'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-sans text-sm text-secondary">Estado</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans ${
                      profile.profile.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {OPERATOR_STATUS_LABELS[profile.profile.status] || profile.profile.status}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-surface-high rounded-xl border border-outline-ghost p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield size={18} className="text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-display text-xl text-primary">Conexiones Externas</h3>
              <p className="font-sans text-xs text-secondary">Integraciones entre servicios</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="font-sans text-sm text-secondary">App de Vendedor</span>
              {sellerConfigured ? (
                <span className="flex items-center gap-2 text-emerald-700">
                  <Wifi size={14} strokeWidth={1.5} />
                  <span className="font-sans text-xs font-medium">Conectado</span>
                </span>
              ) : (
                <span className="flex items-center gap-2 text-red-600">
                  <WifiOff size={14} strokeWidth={1.5} />
                  <span className="font-sans text-xs font-medium">No configurado</span>
                </span>
              )}
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-sans text-sm text-secondary">App de Pagos</span>
              {paymentsConfigured ? (
                <span className="flex items-center gap-2 text-emerald-700">
                  <Wifi size={14} strokeWidth={1.5} />
                  <span className="font-sans text-xs font-medium">Conectado</span>
                </span>
              ) : (
                <span className="flex items-center gap-2 text-red-600">
                  <WifiOff size={14} strokeWidth={1.5} />
                  <span className="font-sans text-xs font-medium">No configurado</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface-high rounded-xl border border-outline-ghost p-6">
          <h3 className="font-display text-xl text-primary mb-1">Cuenta</h3>
          <p className="font-sans text-xs text-secondary mb-4">
            Gestiona tu contrasena y correo a traves de Clerk.
          </p>
          <a
            href={`https://dashboard.clerk.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-xs uppercase tracking-[0.1em] font-sans font-medium hover:bg-primary/90 transition-all"
          >
            Abrir Panel de Clerk
          </a>
        </div>
      </div>
    </main>
  )
}
