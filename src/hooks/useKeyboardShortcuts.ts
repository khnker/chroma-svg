import { useEffect } from 'react'

interface KeyboardShortcutMap {
  onUndo?: () => void
  onRedo?: () => void
  onReset?: () => void
  onExport?: () => void
  onHelp?: () => void
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutMap) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const mod = e.ctrlKey || e.metaKey

      if (mod && e.shiftKey && e.key === 'Z') { e.preventDefault(); handlers.onRedo?.() }
      else if (mod && e.key === 'z') { e.preventDefault(); handlers.onUndo?.() }
      else if (e.key === 'r' && !mod) { e.preventDefault(); handlers.onReset?.() }
      else if (e.key === 'e' && !mod) { e.preventDefault(); handlers.onExport?.() }
      else if (e.key === '?' && !mod) { e.preventDefault(); handlers.onHelp?.() }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
