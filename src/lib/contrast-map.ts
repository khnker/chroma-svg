import { wcagContrast, converter } from 'culori'
import type { Oklch } from 'culori'
import { normalizeColor } from '@/lib/color-utils'
import type { ColorEntry, ContrastMap, ContrastEdge, ContrastWarning, ColorMap } from '@/core/types'

export function getElementBounds(el: Element): { x: number; y: number; w: number; h: number } | null {
  const tag = el.tagName.toLowerCase()
  switch (tag) {
    case 'rect': {
      const x = parseFloat(el.getAttribute('x') || '0')
      const y = parseFloat(el.getAttribute('y') || '0')
      const w = parseFloat(el.getAttribute('width') || '0')
      const h = parseFloat(el.getAttribute('height') || '0')
      if (w === 0 || h === 0) return null
      return { x, y, w, h }
    }
    case 'circle': {
      const cx = parseFloat(el.getAttribute('cx') || '0')
      const cy = parseFloat(el.getAttribute('cy') || '0')
      const r = parseFloat(el.getAttribute('r') || '0')
      if (r === 0) return null
      return { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r }
    }
    case 'ellipse': {
      const cx = parseFloat(el.getAttribute('cx') || '0')
      const cy = parseFloat(el.getAttribute('cy') || '0')
      const rx = parseFloat(el.getAttribute('rx') || '0')
      const ry = parseFloat(el.getAttribute('ry') || '0')
      if (rx === 0 || ry === 0) return null
      return { x: cx - rx, y: cy - ry, w: 2 * rx, h: 2 * ry }
    }
    case 'line': {
      const x1 = parseFloat(el.getAttribute('x1') || '0')
      const y1 = parseFloat(el.getAttribute('y1') || '0')
      const x2 = parseFloat(el.getAttribute('x2') || '0')
      const y2 = parseFloat(el.getAttribute('y2') || '0')
      return { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 1), h: Math.max(Math.abs(y2 - y1), 1) }
    }
    case 'polygon':
    case 'polyline': {
      const points = el.getAttribute('points')
      if (!points) return null
      const nums = points.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g)
      if (!nums || nums.length < 4) return null
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (let i = 0; i + 1 < nums.length; i += 2) {
        const x = parseFloat(nums[i])
        const y = parseFloat(nums[i + 1])
        if (isNaN(x) || isNaN(y)) continue
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
      if (!isFinite(minX)) return null
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
    }
    case 'path': {
      const d = el.getAttribute('d')
      if (!d) return null
      const nums = d.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g)
      if (!nums || nums.length < 2) return null
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (let i = 0; i + 1 < nums.length; i += 2) {
        const x = parseFloat(nums[i])
        const y = parseFloat(nums[i + 1])
        if (isNaN(x) || isNaN(y)) continue
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
      if (!isFinite(minX)) return null
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
    }
    default:
      return null
  }
}

export function boxesOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
  threshold = 1,
): boolean {
  return !(
    a.x > b.x + b.w + threshold ||
    a.x + a.w + threshold < b.x ||
    a.y > b.y + b.h + threshold ||
    a.y + a.h + threshold < b.y
  )
}

const STYLE_RE = /(fill|stroke)\s*:\s*([^;!]+)/gi

function getColorAttr(el: Element, attr: string): string | null {
  const direct = el.getAttribute(attr)
  if (direct && direct !== 'none' && direct !== 'transparent') return direct
  const style = el.getAttribute('style')
  if (!style) return null
  STYLE_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = STYLE_RE.exec(style)) !== null) {
    if (m[1].toLowerCase() === attr) {
      const val = m[2].trim()
      if (val && val !== 'none' && val !== 'transparent') return val
    }
  }
  return null
}

function getEffectiveFill(el: Element): string | null {
  const fill = getColorAttr(el, 'fill')
  if (fill) return fill
  const stroke = getColorAttr(el, 'stroke')
  const strokeWidth = parseFloat(el.getAttribute('stroke-width') || '1')
  if (stroke && strokeWidth > 0) return stroke
  let parent: Element | null = el
  while (parent && parent.parentElement) {
    parent = parent.parentElement
    const pFill = getColorAttr(parent, 'fill')
    if (pFill) return pFill
  }
  return null
}

const SKIP_TAGS = new Set([
  'svg', 'defs', 'clipPath', 'mask', 'pattern', 'symbol',
  'use', 'a', 'marker', 'style', 'linearGradient', 'radialGradient', 'stop', 'filter',
])

export function buildContrastMap(doc: Document): ContrastMap {
  const colorBounds = new Map<string, { x: number; y: number; w: number; h: number }[]>()

  function walk(el: Element): void {
    const tag = el.tagName.toLowerCase()

    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i]
      if (child instanceof Element) walk(child)
    }

    if (SKIP_TAGS.has(tag)) return

    const fill = getEffectiveFill(el)
    if (!fill) return

    const bounds = getElementBounds(el)
    if (!bounds) return

    const hex = normalizeColor(fill)
    if (!hex) return

    if (!colorBounds.has(hex)) colorBounds.set(hex, [])
    colorBounds.get(hex)!.push(bounds)
  }

  walk(doc.documentElement)

  const hexes = Array.from(colorBounds.keys())
  const adjacency: Record<string, string[]> = {}
  const edges: ContrastEdge[] = []

  for (const h of hexes) adjacency[h] = []

  const toOklch = converter('oklch')

  for (let i = 0; i < hexes.length; i++) {
    for (let j = i + 1; j < hexes.length; j++) {
      const aBounds = colorBounds.get(hexes[i])!
      const bBounds = colorBounds.get(hexes[j])!

      let overlapping = false
      for (const ba of aBounds) {
        for (const bb of bBounds) {
          if (boxesOverlap(ba, bb)) {
            overlapping = true
            break
          }
        }
        if (overlapping) break
      }

      if (overlapping) {
        adjacency[hexes[i]].push(hexes[j])
        adjacency[hexes[j]].push(hexes[i])

        const ca = toOklch(hexes[i]) as Oklch
        const cb = toOklch(hexes[j]) as Oklch

        edges.push({
          colorA: hexes[i],
          colorB: hexes[j],
          wcagRatio: wcagContrast(hexes[i], hexes[j]),
          lightnessDiff: Math.abs(ca.l - cb.l),
          hueDiff: Math.min(Math.abs((ca.h ?? 0) - (cb.h ?? 0)), 360 - Math.abs((ca.h ?? 0) - (cb.h ?? 0))),
          chromaDiff: Math.abs(ca.c - cb.c),
        })
      }
    }
  }

  return { adjacency, edges }
}

function assignedPalette(i: number, paletteHexes: string[]): string {
  return paletteHexes[i % paletteHexes.length]
}

export function getContrastWarnings(
  entries: ColorEntry[],
  paletteHexes: string[],
  contrastMap: ContrastMap,
): ContrastWarning[] {
  const hexToIdx = new Map<string, number>()
  entries.forEach((e, i) => hexToIdx.set(e.normalized, i))

  const warnings: ContrastWarning[] = []

  for (const edge of contrastMap.edges) {
    const idxA = hexToIdx.get(edge.colorA)
    const idxB = hexToIdx.get(edge.colorB)
    if (idxA === undefined || idxB === undefined) continue

    const palA = assignedPalette(idxA, paletteHexes)
    const palB = assignedPalette(idxB, paletteHexes)
    const newRatio = wcagContrast(palA, palB)

    if (newRatio < 3.0 && edge.wcagRatio > 4.5) {
      warnings.push({
        type: 'contrast-loss',
        colorA: edge.colorA,
        colorB: edge.colorB,
        originalRatio: edge.wcagRatio,
        newRatio,
        severity: 'high',
      })
    } else if (Math.abs(newRatio - edge.wcagRatio) > 2.0) {
      if (edge.wcagRatio < 3.0 && newRatio > 4.5) {
        warnings.push({
          type: 'contrast-flip',
          colorA: edge.colorA,
          colorB: edge.colorB,
          originalRatio: edge.wcagRatio,
          newRatio,
          severity: 'medium',
        })
      } else {
        warnings.push({
          type: 'contrast-drift',
          colorA: edge.colorA,
          colorB: edge.colorB,
          originalRatio: edge.wcagRatio,
          newRatio,
          severity: 'low',
        })
      }
    }
  }

  return warnings
}

export function getColorMapWarnings(
  contrastMap: ContrastMap,
  colorMap: ColorMap,
): ContrastWarning[] {
  const warnings: ContrastWarning[] = []

  for (const edge of contrastMap.edges) {
    const newA = colorMap[edge.colorA] ?? edge.colorA
    const newB = colorMap[edge.colorB] ?? edge.colorB
    const newRatio = wcagContrast(newA, newB)

    if (newRatio < 3.0 && edge.wcagRatio > 4.5) {
      warnings.push({
        type: 'contrast-loss',
        colorA: edge.colorA,
        colorB: edge.colorB,
        originalRatio: edge.wcagRatio,
        newRatio,
        severity: 'high',
      })
    } else if (Math.abs(newRatio - edge.wcagRatio) > 2.0) {
      if (edge.wcagRatio < 3.0 && newRatio > 4.5) {
        warnings.push({
          type: 'contrast-flip',
          colorA: edge.colorA,
          colorB: edge.colorB,
          originalRatio: edge.wcagRatio,
          newRatio,
          severity: 'medium',
        })
      } else {
        warnings.push({
          type: 'contrast-drift',
          colorA: edge.colorA,
          colorB: edge.colorB,
          originalRatio: edge.wcagRatio,
          newRatio,
          severity: 'low',
        })
      }
    }
  }

  return warnings
}

export function scorePaletteFit(
  entries: ColorEntry[],
  paletteHexes: string[],
  contrastMap: ContrastMap,
): number {
  const hexToIdx = new Map<string, number>()
  entries.forEach((e, i) => hexToIdx.set(e.normalized, i))

  let totalScore = 0
  let count = 0

  for (const edge of contrastMap.edges) {
    const idxA = hexToIdx.get(edge.colorA)
    const idxB = hexToIdx.get(edge.colorB)
    if (idxA === undefined || idxB === undefined) continue

    const newRatio = wcagContrast(
      assignedPalette(idxA, paletteHexes),
      assignedPalette(idxB, paletteHexes),
    )
    const maxRatio = Math.max(edge.wcagRatio, newRatio)
    const edgeScore = 1 - Math.min(Math.abs(edge.wcagRatio - newRatio) / maxRatio, 1)
    totalScore += edgeScore
    count++
  }

  return count > 0 ? totalScore / count : 1
}

export function bestMapping(
  entries: ColorEntry[],
  paletteHexes: string[],
  contrastMap: ContrastMap,
): string[] {
  const n = paletteHexes.length
  if (n === 0) return []
  if (n === 1) return [paletteHexes[0]]

  if (n <= 6) {
    let bestScore = -1
    let bestPerm = paletteHexes.slice()

    function permute(arr: string[], start: number): void {
      if (start === arr.length - 1) {
        const score = scorePaletteFit(entries, arr, contrastMap)
        if (score > bestScore) {
          bestScore = score
          bestPerm = arr.slice()
        }
        return
      }
      for (let i = start; i < arr.length; i++) {
        ;[arr[start], arr[i]] = [arr[i], arr[start]]
        permute(arr, start + 1)
        ;[arr[start], arr[i]] = [arr[i], arr[start]]
      }
    }

    permute(paletteHexes.slice(), 0)
    return bestPerm
  }

  let bestScore = -1
  let bestPerm = paletteHexes.slice()

  const candidates = [paletteHexes.slice(), paletteHexes.slice().reverse()]
  for (let r = 1; r < n; r++) {
    candidates.push([...paletteHexes.slice(r), ...paletteHexes.slice(0, r)])
  }

  for (const cand of candidates) {
    const score = scorePaletteFit(entries, cand, contrastMap)
    if (score > bestScore) {
      bestScore = score
      bestPerm = cand
    }
  }

  return bestPerm
}
