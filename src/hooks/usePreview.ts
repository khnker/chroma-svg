import { useMemo } from 'react'
import type { ColorMap } from '@/core/types'
import { applyColorMap } from '@/core/color-replacer'

export function usePreview(rawSvg: string | null, colorMap: ColorMap) {
  const previewSvg = useMemo(() => {
    if (!rawSvg) return null
    return applyColorMap(rawSvg, colorMap)
  }, [rawSvg, colorMap])

  return { previewSvg }
}
