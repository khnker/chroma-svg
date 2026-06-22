import { useState, useCallback, useRef } from 'react'
import type { ColorMap, ColorEntry, ContrastMap } from '@/core/types'
import { bestMapping } from '@/lib/contrast-map'

const MAX_UNDO = 50

export function useColorMap(initialMap: ColorMap = {}) {
  const [colorMap, setColorMap] = useState<ColorMap>(initialMap)
  const past = useRef<ColorMap[]>([])
  const future = useRef<ColorMap[]>([])
  const colorMapRef = useRef<ColorMap>(colorMap)
  colorMapRef.current = colorMap

  const pushSnapshot = useCallback(() => {
    past.current = [...past.current.slice(-(MAX_UNDO - 1)), colorMapRef.current]
    future.current = []
  }, [])

  const updateColor = useCallback((original: string, replacement: string) => {
    pushSnapshot()
    setColorMap((prev) => ({ ...prev, [original]: replacement }))
  }, [pushSnapshot])

  const applyPalette = useCallback((entries: { original: string; replacement: string }[]) => {
    pushSnapshot()
    setColorMap((prev) => {
      const next = { ...prev }
      for (const e of entries) {
        next[e.original] = e.replacement
      }
      return next
    })
  }, [pushSnapshot])

  const applySmartPalette = useCallback((entries: ColorEntry[], paletteHexes: string[], cmap: ContrastMap) => {
    pushSnapshot()
    const ordered = bestMapping(entries, paletteHexes, cmap)
    setColorMap((prev) => {
      const next = { ...prev }
      for (let i = 0; i < entries.length; i++) {
        next[entries[i].original] = ordered[i % ordered.length]
      }
      return next
    })
  }, [pushSnapshot])

  const resetColor = useCallback((original: string) => {
    pushSnapshot()
    setColorMap((prev) => {
      const next = { ...prev }
      delete next[original]
      return next
    })
  }, [pushSnapshot])

  const resetAll = useCallback(() => {
    pushSnapshot()
    setColorMap({})
  }, [pushSnapshot])

  const undo = useCallback(() => {
    const prev = past.current.pop()
    if (!prev) return
    future.current = [...future.current, colorMapRef.current]
    setColorMap(prev)
  }, [])

  const redo = useCallback(() => {
    const next = future.current.pop()
    if (!next) return
    past.current = [...past.current, colorMapRef.current]
    setColorMap(next)
  }, [])

  const hasChanges = Object.keys(colorMap).length > 0
  const canUndo = past.current.length > 0
  const canRedo = future.current.length > 0

  return { colorMap, hasChanges, canUndo, canRedo, updateColor, applyPalette, applySmartPalette, resetColor, resetAll, undo, redo }
}
