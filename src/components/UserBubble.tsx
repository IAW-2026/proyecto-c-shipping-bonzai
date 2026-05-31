'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useState, useRef, useEffect } from 'react'
import { LogOut, User, Package } from 'lucide-react'

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const f = firstName?.charAt(0) || ''
  const l = lastName?.charAt(0) || ''
  return (f + l).toUpperCase() || 'U'
}

export function UserBubble() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const initials = getInitials(user.firstName, user.lastName)
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario'
  const email = user.primaryEmailAddress?.emailAddress || ''

  return (
    <div ref={ref} className="fixed top-6 right-6 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-surface-high/90 backdrop-blur-sm rounded-full px-3 py-2 shadow-sm hover:shadow-md transition-all"
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={fullName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-surface-low flex items-center justify-center">
            <User size={14} className="text-primary" strokeWidth={1.5} />
          </div>
        )}
        <div className="hidden md:flex flex-col items-start">
          <span className="font-sans text-xs font-medium text-primary leading-tight">
            {fullName}
          </span>
          <span className="font-sans text-[10px] text-secondary leading-tight">
            {email}
          </span>
        </div>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg p-3 min-w-[220px]">
          <div className="px-2 py-1">
            <p className="font-display text-sm text-primary">
              {fullName}
            </p>
            <p className="font-sans text-xs text-secondary mt-0.5">
              {email}
            </p>
          </div>
          <a
            href="/shipping"
            className="flex items-center gap-2 w-full px-2 py-1.5 text-primary hover:bg-surface-low rounded-lg font-sans text-xs transition-colors"
          >
            <Package size={14} strokeWidth={1.5} />
            Mis Envíos
          </a>
          <div className="h-px bg-surface-container my-2" />
          <button
            onClick={() => signOut({ redirectUrl: '/' })}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-red-600/80 hover:bg-red-50 rounded-lg font-sans text-xs transition-colors"
          >
            <LogOut size={14} strokeWidth={1.5} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
