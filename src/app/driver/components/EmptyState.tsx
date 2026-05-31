import { Sprout } from 'lucide-react'

export function EmptyState({ isSupervisor }: { isSupervisor?: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-12 text-center">
      <div className="flex justify-center mb-6">
        <Sprout size={40} className="text-secondary/40" strokeWidth={1.5} />
      </div>
      <h2 className="font-display text-2xl text-primary mb-2">
        El invernadero está en calma.
      </h2>
      <p className="font-sans text-sm text-secondary">
        {isSupervisor
          ? 'No hay traslados activos en este momento.'
          : 'No hay traslados pendientes en tu bitácora.'}
      </p>
    </div>
  )
}
