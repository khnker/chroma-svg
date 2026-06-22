import { useMemo } from 'react'
import { applyColorMap } from '@/core/color-replacer'
import { generateHarmonies } from '@/lib/color-theory'
import { predefinedPalettes } from '@/lib/palette-data'
import type { ColorEntry, ContrastMap, PaletaCustom } from '@/core/types'
import { bestMapping } from '@/lib/contrast-map'

export interface PaletteGalleryItem {
  id: string
  name: string
  category: string
  description: string
  paletteColors: string[]
  previewSvg: string | null
}

export function usePaletteGallery(rawSvg: string | null, colors: ColorEntry[], contrastMap: ContrastMap, customPalettes: PaletaCustom[] = []): PaletteGalleryItem[] {
  return useMemo(() => {
    if (!rawSvg || colors.length === 0) return []

    const sorted = [...colors].sort((a, b) => b.elementCount - a.elementCount)
    const svgColors = sorted.slice(0, MAX_SVG_COLORS)

    const items: PaletteGalleryItem[] = []

    for (const palette of predefinedPalettes) {
      const paletteColors = palette.colors.slice(0, MAX_SVG_COLORS).map((c) => c.hex)
      const orderedPalette = bestMapping(svgColors, paletteColors, contrastMap)
      const colorMap: Record<string, string> = {}
      for (let i = 0; i < svgColors.length; i++) {
        colorMap[svgColors[i].original] = orderedPalette[i % orderedPalette.length]
      }
      items.push({
        id: `predef-${palette.name}`,
        name: palette.name,
        category: palette.category,
        description: `${palette.colors.length} colors`,
        paletteColors,
        previewSvg: applyColorMap(rawSvg, colorMap),
      })
    }

    if (svgColors.length > 0) {
      const seed = svgColors[0].normalized
      const harmonies = generateHarmonies(seed)
      for (const h of harmonies) {
        const orderedPalette = bestMapping(svgColors, h.colors, contrastMap)
        const colorMap: Record<string, string> = {}
        for (let i = 0; i < svgColors.length; i++) {
          colorMap[svgColors[i].original] = orderedPalette[i % orderedPalette.length]
        }
        items.push({
          id: `harmony-${h.name}`,
          name: h.name,
          category: h.category,
          description: h.description,
          paletteColors: h.colors,
          previewSvg: applyColorMap(rawSvg, colorMap),
        })
      }
    }

    for (const cp of customPalettes) {
      const paletteColors = cp.colors.slice(0, MAX_SVG_COLORS)
      const orderedPalette = bestMapping(svgColors, paletteColors, contrastMap)
      const colorMap: Record<string, string> = {}
      for (let i = 0; i < svgColors.length; i++) {
        colorMap[svgColors[i].original] = orderedPalette[i % orderedPalette.length]
      }
      items.push({
        id: `custom-${cp.name}`,
        name: cp.name,
        category: 'From Image',
        description: `${cp.colors.length} colors`,
        paletteColors,
        previewSvg: applyColorMap(rawSvg, colorMap),
      })
    }

    return items
  }, [rawSvg, colors, contrastMap, customPalettes])
}

const MAX_SVG_COLORS = 5
