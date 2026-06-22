import { describe, it, expect } from 'vitest'
import { parseSvgString } from '../../core/svg-parser'

describe('parseSvgString', () => {
  const validSvg = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red" width="10" height="10"/></svg>'

  it('parses valid SVG', () => {
    const result = parseSvgString(validSvg)
    expect(result.success).toBe(true)
    expect(result.document).not.toBeNull()
    expect(result.error).toBeNull()
  })

  it('fails on invalid SVG', () => {
    const result = parseSvgString('not svg')
    expect(result.success).toBe(false)
    expect(result.document).toBeNull()
    expect(result.error).not.toBeNull()
  })

  it('handles empty string', () => {
    const result = parseSvgString('')
    expect(result.success).toBe(false)
  })
})
