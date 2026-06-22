import { describe, it, expect } from 'vitest'
import { generateFilenameFromColors } from '../../lib/color-names'

describe('generateFilenameFromColors', () => {
  it('generates name from color map', () => {
    const map = { '#fff': '#ff0000', '#000': '#00ff00', '#ccc': '#0000ff' }
    const name = generateFilenameFromColors(map)
    expect(name).toMatch(/^[a-z-]+-[a-z-]+-[a-z-]+$/i)
    expect(name.split('-').length).toBe(3)
  })

  it('includes palette name when provided', () => {
    const map = { '#fff': '#ff0000', '#000': '#00ff00' }
    const name = generateFilenameFromColors(map, 'sunset glow')
    expect(name).toMatch(/^sunset-glow-/i)
    expect(name.split('-').length).toBeGreaterThanOrEqual(3)
  })

  it('returns palette for empty color map', () => {
    expect(generateFilenameFromColors({})).toBe('palette')
    expect(generateFilenameFromColors({ '#fff': '' })).toBe('palette')
  })

  it('truncates long names', () => {
    const map = { '#fff': '#ff0000', '#000': '#00ff00', '#ccc': '#0000ff' }
    const name = generateFilenameFromColors(map, null, 10)
    expect(name.length).toBeLessThanOrEqual(10)
  })
})
