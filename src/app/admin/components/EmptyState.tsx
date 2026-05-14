import { Sprout } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="w-16 h-16 rounded-full bg-surface-low flex items-center justify-center mb-6">
        <Sprout size={28} className="text-secondary" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-2xl text-primary mb-2">
        El invernadero esta en calma
      </h3>
      <p className="font-sans text-sm text-secondary text-center max-w-sm">
        No se encontraron envios con los filtros seleccionados. Los especimenes estan a salvo.
      </p>
    </div>
  )
}