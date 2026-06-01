import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth-helpers'
import { UserCard } from './components/UserCard'
import { Sprout, Users } from 'lucide-react'

export default async function JardinerosPage() {
  const admin = await isAdmin()
  if (!admin) {
    redirect('/unauthorized?reason=admin-only')
  }

  const [drivers, operators] = await Promise.all([
    prisma.driver.findMany({ orderBy: { created_at: 'desc' } }),
    prisma.logisticOperator.findMany({ orderBy: { created_at: 'desc' } }),
  ])

  return (
    <main className="p-12 pb-32">
      <header className="mb-12">
        <span className="font-sans text-[11px] uppercase tracking-widest text-secondary">
          Curador Principal
        </span>
        <h1 className="font-display text-5xl md:text-6xl mt-2 text-primary">
          Jardineros
        </h1>
        <p className="font-sans text-sm text-secondary mt-3">
          Repartidores y operadores encargados del archivo vivo.
        </p>
      </header>

      <Section icon={Sprout} title="Repartidores" subtitle="Repartidores activos y suspendidos">
        {drivers.length === 0 ? (
          <EmptyMessage message="Aun no hay repartidores registrados." />
        ) : (
          <div className="space-y-4">
            {drivers.map((d) => (
              <UserCard
                key={d.id}
                type="driver"
                clerkUserId={d.clerk_user_id}
                status={d.status}
                driverId={d.id}
              />
            ))}
          </div>
        )}
      </Section>

      <Section icon={Users} title="Operadores" subtitle="Operadores logísticos">
        {operators.length === 0 ? (
          <EmptyMessage message="Aun no hay operadores registrados." />
        ) : (
          <div className="space-y-4">
            {operators.map((o) => (
              <UserCard
                key={o.id}
                type="operator"
                clerkUserId={o.clerk_user_id}
                status={o.status}
                operatorId={o.id}
              />
            ))}
          </div>
        )}
      </Section>
    </main>
  )
}

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="font-display text-2xl text-primary">{title}</h2>
          <p className="font-sans text-xs text-secondary">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <div className="text-center py-8">
      <p className="font-sans text-sm text-secondary">{message}</p>
    </div>
  )
}
