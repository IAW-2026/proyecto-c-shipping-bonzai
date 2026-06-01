import { DispatchTestForm } from './components/DispatchTestForm'

export default function TestDispatchPage() {
  return (
    <main className="min-h-screen bg-background p-12 pb-32">
      <header className="mb-12">
        <span className="font-sans text-[11px] uppercase tracking-widest text-secondary">
          Pruebas de API
        </span>
        <h1 className="font-display text-5xl md:text-6xl mt-2 text-primary">
          Endpoint de Despacho
        </h1>
        <p className="font-sans text-sm text-secondary mt-3">
          Herramienta de prueba para el endpoint /api/shipping/dispatch. Las cookies de sesión se envían automáticamente.
        </p>
      </header>

      <DispatchTestForm />
    </main>
  )
}
