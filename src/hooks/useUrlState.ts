import { useCallback, useRef, useEffect } from 'react'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { ColorMap } from '@/core/types'

interface HashState {
  raw: string
  fileName: string
  colorMap: ColorMap
}

export function useUrlState() {
  const initialState = (() => {
    try {
      const hash = window.location.hash.slice(1)
      if (!hash) return null
      const decompressed = decompressFromEncodedURIComponent(hash)
      if (!decompressed) return null
      return JSON.parse(decompressed) as HashState
    } catch {
      return null
    }
  })()

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const pushState = useCallback((raw: string, fileName: string, colorMap: ColorMap) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      try {
        const data: HashState = { raw, fileName, colorMap }
        const compressed = compressToEncodedURIComponent(JSON.stringify(data))
        window.location.hash = compressed
      } catch {}
    }, 800)
  }, [])

  const clearUrl = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    history.replaceState(null, '', window.location.pathname)
  }, [])

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  return { initialState, pushState, clearUrl }
}
