import { useState, useEffect, useRef } from 'react'
import type { ColorEntry, ContrastMap, ExtractResult } from '@/core/types'
import { parseSvgString } from '@/core/svg-parser'
import { extractColors } from '@/core/color-extractor'

interface ColorExtractorState {
  colors: ColorEntry[]
  contrastMap: ContrastMap
  isLoading: boolean
}

export function useColorExtractor(rawSvg: string | null, svgId?: string) {
  const [state, setState] = useState<ColorExtractorState>({
    colors: [],
    contrastMap: { adjacency: {}, edges: [] },
    isLoading: false,
  })
  const cache = useRef(new Map<string, ExtractResult>())

  useEffect(() => {
    if (!rawSvg) {
      setState({ colors: [], contrastMap: { adjacency: {}, edges: [] }, isLoading: false })
      return
    }

    if (svgId && cache.current.has(svgId)) {
      const cached = cache.current.get(svgId)!
      setState({ colors: cached.colors, contrastMap: cached.contrastMap, isLoading: false })
      return
    }

    setState((prev) => ({ ...prev, isLoading: true }))

    const result = parseSvgString(rawSvg)
    if (!result.success || !result.document) {
      setState({ colors: [], contrastMap: { adjacency: {}, edges: [] }, isLoading: false })
      return
    }
    const { colors, contrastMap } = extractColors(result.document)
    if (svgId) cache.current.set(svgId, { colors, contrastMap })
    setState({ colors, contrastMap, isLoading: false })
  }, [rawSvg, svgId])

  return { colors: state.colors, contrastMap: state.contrastMap, isLoading: state.isLoading }
}
