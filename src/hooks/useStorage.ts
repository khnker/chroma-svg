import { useState, useCallback, useRef, useEffect } from 'react'
import type { SvgEntry, ColorMap } from '@/core/types'

const STORAGE_KEY = 'chroma_session'
const MAX_SVGS = 5

interface SessionData {
  version: 1
  svgs: { raw: string; fileName: string }[]
  colorMap: ColorMap
  activeIndex: number
}

export function useStorage() {
  const [initialSvgs, setInitialSvgs] = useState<{ raw: string; fileName: string }[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as SessionData
        if (parsed.version === 1) return parsed.svgs.slice(0, MAX_SVGS)
      }
    } catch {}
    return []
  })

  const [initialColorMap, setInitialColorMap] = useState<ColorMap>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as SessionData
        if (parsed.version === 1) return parsed.colorMap
      }
    } catch {}
    return {}
  })

  const [initialActiveIndex, setInitialActiveIndex] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as SessionData
        if (parsed.version === 1) return parsed.activeIndex
      }
    } catch {}
    return -1
  })

  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const persist = useCallback((svgs: SvgEntry[], colorMap: ColorMap, activeIndex: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      try {
        const toSave = svgs.slice(0, MAX_SVGS).map(({ raw, fileName }) => ({ raw, fileName }))
        const data: SessionData = { version: 1, svgs: toSave, colorMap, activeIndex }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch {
        // quota exceeded or full
      }
    }, 500)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setInitialSvgs([])
    setInitialColorMap({})
    setInitialActiveIndex(-1)
  }, [])

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  return { initialSvgs, initialColorMap, initialActiveIndex, persist, clearSession }
}
