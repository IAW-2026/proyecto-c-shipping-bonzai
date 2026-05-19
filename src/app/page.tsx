import Link from 'next/link'
import { Leaf } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <Leaf size={48} className="text-primary mx-auto mb-4" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-6xl text-primary mb-4">
          The Living Archive
        </h1>
        <p className="font-sans text-lg text-secondary mb-2">
          Bonzai Shipping Portal
        </p>
        <p className="font-sans text-sm text-secondary/70 mb-12 max-w-md mx-auto">
          Gestion del ciclo de vida de los envios botanicos. Desde plantas vivas 
          hasta insumos especializados, cada especimen es un registro curado en tránsito.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl text-sm uppercase tracking-[0.1em] font-sans font-medium hover:bg-primary/90 transition-all"
        >
          Entrar al Archivo
        </Link>
      </div>
    </div>
  )
}