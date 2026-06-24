import { useState, useCallback, useRef } from 'react'
import type { SvgEntry } from '@/core/types'

interface MultiSvgState {
  svgs: SvgEntry[]
  activeIndex: number
}

export function useMultiSvg(initialSvgs: SvgEntry[] = []) {
  const [state, setState] = useState<MultiSvgState>({ svgs: initialSvgs, activeIndex: initialSvgs.length > 0 ? 0 : -1 })
  const svgsRef = useRef(state.svgs)
  svgsRef.current = state.svgs

  const addSvg = useCallback((raw: string, fileName: string): string => {
    const id = crypto.randomUUID()
    setState((prev) => ({
      svgs: [...prev.svgs, { id, raw, fileName }],
      activeIndex: prev.svgs.length,
    }))
    return id
  }, [])

  const removeSvg = useCallback((id: string) => {
    setState((prev) => {
      const idx = prev.svgs.findIndex((s) => s.id === id)
      if (idx === -1) return prev
      const next = prev.svgs.filter((s) => s.id !== id)
      let newIndex = prev.activeIndex
      if (prev.activeIndex === idx) newIndex = Math.max(0, prev.activeIndex - 1)
      else if (prev.activeIndex > idx) newIndex = prev.activeIndex - 1
      return { svgs: next, activeIndex: Math.min(newIndex, next.length - 1) }
    })
  }, [])

  const setActive = useCallback((id: string) => {
    setState((prev) => {
      const idx = prev.svgs.findIndex((s) => s.id === id)
      if (idx === -1) return prev
      return { ...prev, activeIndex: idx }
    })
  }, [])

  const renameSvg = useCallback((id: string, fileName: string) => {
    setState((prev) => ({
      ...prev,
      svgs: prev.svgs.map((s) => (s.id === id ? { ...s, fileName } : s)),
    }))
  }, [])

  const updateSvg = useCallback((id: string, raw: string) => {
    setState((prev) => ({
      ...prev,
      svgs: prev.svgs.map((s) => (s.id === id ? { ...s, raw } : s)),
    }))
  }, [])

  const activeSvg = state.svgs[state.activeIndex] ?? null
  const hasSvgs = state.svgs.length > 0

  return {
    svgs: state.svgs,
    activeIndex: state.activeIndex,
    activeSvg,
    hasSvgs,
    addSvg,
    removeSvg,
    setActive,
    renameSvg,
    updateSvg,
  }
}
