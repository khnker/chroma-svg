import { describe, it, expect } from 'vitest'
import { parseSvgString } from '@/core/svg-parser'
import { extractColors } from '@/core/color-extractor'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
  <rect x="0" y="0" width="200" height="100" style="fill:#31337d" />
  <rect x="0" y="100" width="200" height="100" style="fill:#3060ab" />
  <rect x="0" y="200" width="200" height="100" style="fill:#1e1c58" />
</svg>`

describe('style-attribute colors', () => {
  it('extracts colors from style="fill:..." attributes', () => {
    const result = parseSvgString(svg)
    expect(result.success).toBe(true)
    const { colors } = extractColors(result.document!)
    expect(colors.length).toBe(3)
    const hexes = colors.map(c => c.normalized)
    expect(hexes).toContain('#31337d')
    expect(hexes).toContain('#3060ab')
    expect(hexes).toContain('#1e1c58')
    expect(colors[0].areaWeight).toBeGreaterThan(0)
  })
})