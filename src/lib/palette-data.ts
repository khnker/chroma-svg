import type { Palette } from '@/core/types'
import { curatedPalettes } from './palettes/curated-palettes'

export const predefinedPalettes: Palette[] = curatedPalettes

export function findPalettes(query: string): Palette[] {
  const q = query.toLowerCase()
  return predefinedPalettes.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.colors.some((c) => c.name.toLowerCase().includes(q))
  )
}

export function getPaletteByName(name: string): Palette | undefined {
  return predefinedPalettes.find((p) => p.name.toLowerCase() === name.toLowerCase())
}
