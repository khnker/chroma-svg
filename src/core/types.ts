export interface ColorEntry {
  original: string
  normalized: string
  selectors: SvgColorAttr[]
  label: string
  elementCount: number
  areaWeight: number
}

export interface SvgColorAttr {
  elementTag: string
  attribute: string
  cssSelector: string
  value: string
}

export interface ColorMap {
  [original: string]: string
}

export interface ParseResult {
  success: boolean
  document: Document | null
  error: string | null
}

export interface PaletteColor {
  name: string
  hex: string
}

export interface Palette {
  name: string
  category: string
  colors: PaletteColor[]
}

export interface TriChromeResult {
  dominant: ColorEntry[]
  harmony: string
}

export interface SvgEntry {
  id: string
  raw: string
  fileName: string
}

export interface ExtractResult {
  colors: ColorEntry[]
  contrastMap: ContrastMap
}

export interface ContrastEdge {
  colorA: string
  colorB: string
  wcagRatio: number
  lightnessDiff: number
  hueDiff: number
  chromaDiff: number
}

export interface ContrastMap {
  adjacency: Record<string, string[]>
  edges: ContrastEdge[]
}

export interface ContrastWarning {
  type: 'contrast-loss' | 'contrast-drift' | 'contrast-flip'
  colorA: string
  colorB: string
  originalRatio: number
  newRatio: number
  severity: 'low' | 'medium' | 'high'
}

export interface PaletaCustom {
  name: string
  colors: string[]
}
