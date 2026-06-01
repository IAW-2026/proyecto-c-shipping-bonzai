import { Leaf } from 'lucide-react'

export function Footer() {
  return (
    <footer className="p-8 border-t border-outline-ghost bg-surface-high dark:bg-dark-bg dark:border-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary p-1 rounded">
              <Leaf size={14} className="text-white" strokeWidth={1.5} />
            </div>
            <span className="font-display text-lg font-bold text-primary dark:text-surface-high">
              Botanical Curator
            </span>
          </div>
          <p className="text-[10px] text-secondary uppercase tracking-widest">
              Gestión de Especimenes de Grado Institucional
          </p>
        </div>
        <div className="flex gap-12 text-[10px] font-bold uppercase tracking-widest text-secondary">
          <span className="hover:text-primary transition-colors cursor-pointer">Soporte</span>
          <span className="hover:text-primary transition-colors cursor-pointer">API Docs</span>
          <span className="hover:text-primary transition-colors cursor-pointer">Seguridad</span>
          <span className="hover:text-primary transition-colors cursor-pointer">Sostenibilidad</span>
        </div>
        <p className="text-[10px] text-secondary uppercase tracking-widest">
          2026 Botanical Curator. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}