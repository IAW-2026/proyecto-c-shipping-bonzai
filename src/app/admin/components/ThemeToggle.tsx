'use client'

import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'

function getInitialTheme() {
  if (typeof window === 'undefined') return false
  const saved = localStorage.getItem('theme')
  if (saved === 'dark') return true
  if (saved === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const initial = getInitialTheme()
    if (initial) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return initial
  })

  const toggle = () => {
    const newDark = !isDark
    setIsDark(newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 p-4 bg-surface-high dark:bg-slate-800 border border-outline-ghost dark:border-slate-700 rounded-full shadow-xl hover:scale-110 transition-all z-50"
    >
      <Sun
        size={20}
        className={`text-primary ${isDark ? 'hidden' : 'block'}`}
        strokeWidth={1.5}
      />
      <Moon
        size={20}
        className={`text-accent ${isDark ? 'block' : 'hidden'}`}
        strokeWidth={1.5}
      />
    </button>
  )
}