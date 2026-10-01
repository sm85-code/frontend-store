'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { THEME_KEY } from '../theme-script'
import { Button } from './button'

function apply(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? 'Pakai tema terang' : 'Pakai tema gelap'}
      onClick={() => {
        const next = !dark
        setDark(next)
        apply(next)
        try {
          localStorage.setItem(THEME_KEY, next ? 'dark' : 'light')
        } catch {
          /* storage may be blocked; the toggle still works for this session */
        }
      }}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  )
}
