// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { parseSvgString } from '../../core/svg-parser'
import { wcagContrast } from 'culori'
import {
  getElementBounds,
  boxesOverlap,
  buildContrastMap,
  getContrastWarnings,
  scorePaletteFit,
  bestMapping,
} from '../../lib/contrast-map'
import type { ColorEntry } from '../../core/types'

function rect(x: number, y: number, w: number, h: number) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  el.setAttribute('x', String(x))
  el.setAttribute('y', String(y))
  el.setAttribute('width', String(w))
  el.setAttribute('height', String(h))
  return el
}

describe('getElementBounds', () => {
  it('returns bounds for rect', () => {
    const el = rect(10, 20, 100, 50)
    expect(getElementBounds(el)).toEqual({ x: 10, y: 20, w: 100, h: 50 })
  })

  it('returns null for zero-area rect', () => {
    const el = rect(0, 0, 0, 0)
    expect(getElementBounds(el)).toBeNull()
  })

  it('returns bounds for circle', () => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    el.setAttribute('cx', '50')
    el.setAttribute('cy', '50')
    el.setAttribute('r', '20')
    expect(getElementBounds(el)).toEqual({ x: 30, y: 30, w: 40, h: 40 })
  })

  it('returns bounds for ellipse', () => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
    el.setAttribute('cx', '30')
    el.setAttribute('cy', '40')
    el.setAttribute('rx', '10')
    el.setAttribute('ry', '5')
    expect(getElementBounds(el)).toEqual({ x: 20, y: 35, w: 20, h: 10 })
  })

  it('returns bounds for line', () => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    el.setAttribute('x1', '0')
    el.setAttribute('y1', '0')
    el.setAttribute('x2', '100')
    el.setAttribute('y2', '50')
    const b = getElementBounds(el)
    expect(b!.x).toBe(0)
    expect(b!.y).toBe(0)
    expect(b!.w).toBe(100)
    expect(b!.h).toBe(50)
  })

  it('returns bounds for polygon', () => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    el.setAttribute('points', '0,0 100,0 50,100')
    expect(getElementBounds(el)).toEqual({ x: 0, y: 0, w: 100, h: 100 })
  })

  it('returns bounds for path with M/L commands', () => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    el.setAttribute('d', 'M0,0 L100,0 L50,100 Z')
    expect(getElementBounds(el)).toEqual({ x: 0, y: 0, w: 100, h: 100 })
  })

  it('returns null for unsupported elements', () => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    el.setAttribute('x', '10')
    el.setAttribute('y', '20')
    expect(getElementBounds(el)).toBeNull()
  })
})

describe('boxesOverlap', () => {
  it('returns true for overlapping rects', () => {
    const a = { x: 0, y: 0, w: 100, h: 100 }
    const b = { x: 50, y: 50, w: 100, h: 100 }
    expect(boxesOverlap(a, b)).toBe(true)
  })

  it('returns true for nested rects', () => {
    const a = { x: 0, y: 0, w: 200, h: 200 }
    const b = { x: 50, y: 50, w: 50, h: 50 }
    expect(boxesOverlap(a, b)).toBe(true)
  })

  it('returns false for separated rects', () => {
    const a = { x: 0, y: 0, w: 100, h: 100 }
    const b = { x: 200, y: 200, w: 100, h: 100 }
    expect(boxesOverlap(a, b)).toBe(false)
  })

  it('returns true for touching at edge with threshold', () => {
    const a = { x: 0, y: 0, w: 100, h: 100 }
    const b = { x: 100, y: 0, w: 100, h: 100 }
    expect(boxesOverlap(a, b, 1)).toBe(true)
  })

  it('returns false for touching but beyond threshold', () => {
    const a = { x: 0, y: 0, w: 100, h: 100 }
    const b = { x: 102, y: 0, w: 100, h: 100 }
    expect(boxesOverlap(a, b, 1)).toBe(false)
  })
})

describe('buildContrastMap', () => {
  it('detects adjacency for overlapping rects of different colors', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">'
      + '<rect x="0" y="0" width="100" height="100" fill="red"/>'
      + '<rect x="50" y="50" width="100" height="100" fill="blue"/>'
      + '</svg>'
    const doc = parseSvgString(svg).document!
    const map = buildContrastMap(doc)
    expect(map.edges.length).toBe(1)
    expect(map.edges[0].colorA).toBe('#ff0000')
    expect(map.edges[0].colorB).toBe('#0000ff')
    expect(map.edges[0].wcagRatio).toBeGreaterThan(2)
    expect(map.adjacency['#ff0000']).toContain('#0000ff')
    expect(map.adjacency['#0000ff']).toContain('#ff0000')
  })

  it('does not create adjacency for separated rects', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">'
      + '<rect x="0" y="0" width="50" height="50" fill="red"/>'
      + '<rect x="200" y="200" width="50" height="50" fill="blue"/>'
      + '</svg>'
    const doc = parseSvgString(svg).document!
    const map = buildContrastMap(doc)
    expect(map.edges.length).toBe(0)
  })

  it('handles inherited fill from parent g', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">'
      + '<g fill="green"><rect x="0" y="0" width="50" height="50"/></g>'
      + '<rect x="40" y="40" width="50" height="50" fill="red"/>'
      + '</svg>'
    const doc = parseSvgString(svg).document!
    const map = buildContrastMap(doc)
    expect(map.edges.length).toBe(1)
    expect(map.edges[0].colorA).toBe('#008000')
    expect(map.edges[0].colorB).toBe('#ff0000')
  })

  it('handles stroke fallback when fill is none', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">'
      + '<rect x="0" y="0" width="50" height="50" fill="none" stroke="purple" stroke-width="2"/>'
      + '<rect x="40" y="40" width="50" height="50" fill="orange"/>'
      + '</svg>'
    const doc = parseSvgString(svg).document!
    const map = buildContrastMap(doc)
    expect(map.edges.length).toBe(1)
  })

  it('handles many rects with same color', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">'
      + '<rect x="0" y="0" width="100" height="100" fill="#e74c3c"/>'
      + '<rect x="50" y="50" width="100" height="100" fill="#e74c3c"/>'
      + '<rect x="150" y="0" width="100" height="100" fill="#3498db"/>'
      + '</svg>'
    const doc = parseSvgString(svg).document!
    const map = buildContrastMap(doc)
    expect(map.edges.length).toBe(1)
    expect(map.edges[0].colorA).toBe('#e74c3c')
    expect(map.edges[0].colorB).toBe('#3498db')
  })
})

describe('scorePaletteFit', () => {
  it('returns 1 for empty contrast map (no edges)', () => {
    const entries: ColorEntry[] = [
      { original: '#f00', normalized: '#ff0000', selectors: [], label: 'red', elementCount: 1, areaWeight: 50 },
      { original: '#00f', normalized: '#0000ff', selectors: [], label: 'blue', elementCount: 1, areaWeight: 50 },
    ]
    const score = scorePaletteFit(entries, ['#ff0000', '#0000ff'], { adjacency: {}, edges: [] })
    expect(score).toBe(1)
  })

  it('returns 1 when identical palette preserves original ratios', () => {
    const entries: ColorEntry[] = [
      { original: '#f00', normalized: '#ff0000', selectors: [], label: 'red', elementCount: 1, areaWeight: 50 },
      { original: '#00f', normalized: '#0000ff', selectors: [], label: 'blue', elementCount: 1, areaWeight: 50 },
    ]
    const map = {
      adjacency: { '#ff0000': ['#0000ff'], '#0000ff': ['#ff0000'] },
      edges: [{ colorA: '#ff0000', colorB: '#0000ff', wcagRatio: wcagContrast('#ff0000', '#0000ff'), lightnessDiff: 0, hueDiff: 0, chromaDiff: 0 }],
    }
    const score = scorePaletteFit(entries, ['#ff0000', '#0000ff'], map)
    expect(score).toBeCloseTo(1, 2)
  })

  it('returns lower score when palette changes ratios significantly', () => {
    const entries: ColorEntry[] = [
      { original: '#000', normalized: '#000000', selectors: [], label: 'black', elementCount: 1, areaWeight: 50 },
      { original: '#fff', normalized: '#ffffff', selectors: [], label: 'white', elementCount: 1, areaWeight: 50 },
    ]
    const map = {
      adjacency: { '#000000': ['#ffffff'], '#ffffff': ['#000000'] },
      edges: [{ colorA: '#000000', colorB: '#ffffff', wcagRatio: 21, lightnessDiff: 1, hueDiff: 0, chromaDiff: 0 }],
    }
    const score = scorePaletteFit(entries, ['#000000', '#eeeeee'], map)
    expect(score).toBeLessThan(1)
    expect(score).toBeGreaterThan(0)
  })
})

describe('getContrastWarnings', () => {
  it('detects contrast-loss when palette lowers ratio below 3.0', () => {
    const entries: ColorEntry[] = [
      { original: '#000', normalized: '#000000', selectors: [], label: 'black', elementCount: 1, areaWeight: 50 },
      { original: '#fff', normalized: '#ffffff', selectors: [], label: 'white', elementCount: 1, areaWeight: 50 },
    ]
    const map = {
      adjacency: { '#000000': ['#ffffff'], '#ffffff': ['#000000'] },
      edges: [{ colorA: '#000000', colorB: '#ffffff', wcagRatio: 21, lightnessDiff: 1, hueDiff: 0, chromaDiff: 0 }],
    }
    const warnings = getContrastWarnings(entries, ['#000000', '#333333'], map)
    expect(warnings.length).toBe(1)
    expect(warnings[0].type).toBe('contrast-loss')
    expect(warnings[0].severity).toBe('high')
  })

  it('returns empty warnings when palette is identical', () => {
    const entries: ColorEntry[] = [
      { original: '#f00', normalized: '#ff0000', selectors: [], label: 'red', elementCount: 1, areaWeight: 50 },
      { original: '#00f', normalized: '#0000ff', selectors: [], label: 'blue', elementCount: 1, areaWeight: 50 },
    ]
    const map = {
      adjacency: { '#ff0000': ['#0000ff'], '#0000ff': ['#ff0000'] },
      edges: [{ colorA: '#ff0000', colorB: '#0000ff', wcagRatio: wcagContrast('#ff0000', '#0000ff'), lightnessDiff: 0, hueDiff: 0, chromaDiff: 0 }],
    }
    const warnings = getContrastWarnings(entries, ['#ff0000', '#0000ff'], map)
    expect(warnings.length).toBe(0)
  })
})

describe('bestMapping', () => {
  it('returns same array for single palette color', () => {
    const entries: ColorEntry[] = [
      { original: '#f00', normalized: '#ff0000', selectors: [], label: 'red', elementCount: 1, areaWeight: 50 },
    ]
    const map = { adjacency: {}, edges: [] }
    expect(bestMapping(entries, ['#ff0000'], map)).toEqual(['#ff0000'])
  })

  it('finds best permutation for 3 colors', () => {
    const entries: ColorEntry[] = [
      { original: '#000', normalized: '#000000', selectors: [], label: 'black', elementCount: 1, areaWeight: 50 },
      { original: '#fff', normalized: '#ffffff', selectors: [], label: 'white', elementCount: 1, areaWeight: 50 },
      { original: '#f00', normalized: '#ff0000', selectors: [], label: 'red', elementCount: 1, areaWeight: 50 },
    ]
    const map = {
      adjacency: {
        '#000000': ['#ffffff', '#ff0000'],
        '#ffffff': ['#000000', '#ff0000'],
        '#ff0000': ['#000000', '#ffffff'],
      },
      edges: [
        { colorA: '#000000', colorB: '#ffffff', wcagRatio: 21, lightnessDiff: 1, hueDiff: 0, chromaDiff: 0 },
        { colorA: '#000000', colorB: '#ff0000', wcagRatio: wcagContrast('#000000', '#ff0000'), lightnessDiff: 0.5, hueDiff: 0, chromaDiff: 0 },
        { colorA: '#ffffff', colorB: '#ff0000', wcagRatio: wcagContrast('#ffffff', '#ff0000'), lightnessDiff: 0.5, hueDiff: 0, chromaDiff: 0 },
      ],
    }
    const result = bestMapping(entries, ['#000000', '#ffffff', '#ff0000'], map)
    expect(result).toHaveLength(3)
    expect(new Set(result)).toEqual(new Set(['#000000', '#ffffff', '#ff0000']))
  })
})
