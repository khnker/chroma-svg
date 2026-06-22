import { useState, useCallback, useRef, useEffect } from 'react'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { SvgEntry, ColorMap } from '@/core/types'

const MAX_HASH_BYTES = 32000

interface StoredState {
  svgs: { raw: string; fileName: string }[]
  colorMap: ColorMap
}

export function useUrlState() {
  const [initialState] = useState<StoredState | null>(() => {
    try {
      const hash = window.location.hash.slice(1)
      if (!hash) return null
      const decompressed = decompressFromEncodedURIComponent(hash)
      if (!decompressed) return null
      return JSON.parse(decompressed) as StoredState
    } catch {
      return null
    }
  })

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const pushState = useCallback((svgs: SvgEntry[], colorMap: ColorMap) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      try {
        const data: StoredState = {
          svgs: svgs.map(({ raw, fileName }) => ({ raw, fileName })),
          colorMap,
        }
        const json = JSON.stringify(data)
        const payload = json.length > MAX_HASH_BYTES
          ? JSON.stringify({ colorMap })
          : json
        const compressed = compressToEncodedURIComponent(payload)
        window.location.hash = compressed
      } catch {
        // silently fail
      }
    }, 500)
  }, [])

  const clearUrl = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    history.replaceState(null, '', window.location.pathname)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { initialState, pushState, clearUrl }
}
