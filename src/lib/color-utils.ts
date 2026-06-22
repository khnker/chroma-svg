import { formatHex, parse, converter, wcagContrast } from 'culori'

export function normalizeColor(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    const parsed = parse(trimmed)
    if (!parsed) return null
    return formatHex(parsed).toLowerCase()
  } catch {
    return null
  }
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const parsed = parse(hex)
  if (!parsed) return null
  const rgb = converter('rgb')(parsed)
  return {
    r: Math.round(rgb.r * 255),
    g: Math.round(rgb.g * 255),
    b: Math.round(rgb.b * 255),
  }
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const parsed = parse(hex)
  if (!parsed) return null
  const hsl = converter('hsl')(parsed)
  return { h: hsl.h ?? 0, s: hsl.s ?? 0, l: hsl.l ?? 0 }
}

export function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value.trim())
}

export function getContrast(hex1: string, hex2: string): number {
  const c1 = parse(hex1)
  const c2 = parse(hex2)
  if (!c1 || !c2) return 0
  return wcagContrast(c1, c2)
}

export function isLightColor(hex: string): boolean {
  const parsed = parse(hex)
  if (!parsed) return false
  const rgb = converter('rgb')(parsed)
  const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b
  return luminance > 0.5
}

export function isNearBlackOrWhite(hex: string): boolean {
  const parsed = parse(hex)
  if (!parsed) return false
  const rgb = converter('rgb')(parsed)
  const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b
  return luminance < 0.03 || luminance > 0.97
}

export function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)
  if (!rgb1 || !rgb2) return Infinity
  return Math.sqrt(
    (rgb1.r - rgb2.r) ** 2 +
    (rgb1.g - rgb2.g) ** 2 +
    (rgb1.b - rgb2.b) ** 2
  )
}

export interface AdjacentContrastPair {
  colorA: string
  colorB: string
  currentA: string
  currentB: string
  ratio: number
}

export function getAdjacentContrastPairs(
  edges: { colorA: string; colorB: string; wcagRatio: number }[],
  colorMap: Record<string, string>,
  threshold = 3,
): AdjacentContrastPair[] {
  const pairs: AdjacentContrastPair[] = []
  for (const edge of edges) {
    const currentA = colorMap[edge.colorA] ?? edge.colorA
    const currentB = colorMap[edge.colorB] ?? edge.colorB
    const ratio = getContrast(currentA, currentB)
    if (ratio < threshold) {
      pairs.push({ colorA: edge.colorA, colorB: edge.colorB, currentA, currentB, ratio })
    }
  }
  return pairs
}
