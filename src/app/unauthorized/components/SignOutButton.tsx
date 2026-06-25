'use client'

import { useClerk } from '@clerk/nextjs'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  const { signOut } = useClerk()

  return (
    <button
      onClick={() => signOut({ redirectUrl: '/' })}
      className="flex items-center justify-center gap-2 w-full h-11 border border-outline-ghost hover:bg-surface-low text-primary rounded-xl font-sans text-sm transition-colors"
    >
      <LogOut size={16} strokeWidth={1.5} />
      Cerrar sesión
    </button>
  )
}
