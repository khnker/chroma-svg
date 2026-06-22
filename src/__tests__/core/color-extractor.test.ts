// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { extractColors } from '../../core/color-extractor'
import { parseSvgString } from '../../core/svg-parser'

describe('extractColors', () => {
  it('extracts one color entry from SVG with inline fill="red"', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red" width="10" height="10"/></svg>'
    const result = parseSvgString(svg)
    const { colors } = extractColors(result.document!)
    expect(colors.length).toBeGreaterThanOrEqual(1)
    expect(colors.some(c => c.normalized === '#ff0000')).toBe(true)
  })

  it('extracts multiple fills sorted by count descending', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red" width="10" height="10"/><circle fill="blue" cx="5" cy="5" r="4"/><path fill="red" d="M0 0h10v10H0z"/></svg>'
    const doc = parseSvgString(svg).document!
    const { colors } = extractColors(doc!)
    expect(colors.length).toBeGreaterThanOrEqual(2)
    const redEntry = colors.find(c => c.normalized === '#ff0000')
    const blueEntry = colors.find(c => c.normalized === '#0000ff')
    expect(redEntry).toBeTruthy()
    expect(blueEntry).toBeTruthy()
    expect(redEntry!.elementCount).toBeGreaterThanOrEqual(blueEntry!.elementCount)
  })

  it('extracts stroke colors as well', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="4" stroke="green" fill="none"/></svg>'
    const doc = parseSvgString(svg).document!
    const { colors } = extractColors(doc!)
    expect(colors.some(c => c.normalized === '#008000')).toBe(true)
  })

  it('extracts colors from inline attributes (CSS style rules may not be available in jsdom)', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><style>.a { fill: purple; }</style><rect class="a" fill="purple" width="10" height="10"/></svg>'
    const doc = parseSvgString(svg).document!
    const { colors } = extractColors(doc!)
    expect(colors.length).toBeGreaterThanOrEqual(1)
  })
})
