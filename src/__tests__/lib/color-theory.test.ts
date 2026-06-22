import { describe, it, expect } from 'vitest'
import { generateHarmonies } from '../../lib/color-theory'

describe('generateHarmonies', () => {
  it('monochromatic returns 5 colors', () => {
    const result = generateHarmonies('#ff0000')
    const mono = result.find((p) => p.name === 'Monochromatic')!
    expect(mono.colors.length).toBe(5)
    mono.colors.forEach((h) => expect(h).toMatch(/^#[0-9a-f]{6}$/i))
  })

  it('monochromatic: red hues are dominant', () => {
    const result = generateHarmonies('#ff0000')
    const mono = result.find((p) => p.name === 'Monochromatic')!
    mono.colors.forEach((h) => {
      const r = parseInt(h.slice(1, 3), 16)
      const g = parseInt(h.slice(3, 5), 16)
      const b = parseInt(h.slice(5, 7), 16)
      expect(r).toBeGreaterThanOrEqual(g)
      expect(r).toBeGreaterThanOrEqual(b)
    })
  })

  it('complementary returns 5 colors with seed first', () => {
    const result = generateHarmonies('#ff0000')
    const comp = result.find((p) => p.name === 'Complementary')!
    expect(comp.colors.length).toBe(5)
    expect(comp.colors[0]).toBe('#ff0000')
  })

  it('analogous returns 5 colors', () => {
    const result = generateHarmonies('#ff0000')
    const analogous = result.find((p) => p.name === 'Analogous')!
    expect(analogous.colors.length).toBe(5)
  })

  it('triadic returns 5 colors', () => {
    const result = generateHarmonies('#ff0000')
    const tri = result.find((p) => p.name === 'Triadic')!
    expect(tri.colors.length).toBe(5)
  })

  it('tetradic returns 5 colors', () => {
    const result = generateHarmonies('#ff0000')
    const tetra = result.find((p) => p.name === 'Tetradic')!
    expect(tetra.colors.length).toBe(5)
  })

  it('returns correct palette structure', () => {
    const result = generateHarmonies('#00ff00')
    expect(result.length).toBe(6)
    result.forEach((p) => {
      expect(p).toHaveProperty('name')
      expect(p).toHaveProperty('category')
      expect(p).toHaveProperty('description')
      expect(p.colors.length).toBe(5)
    })
  })
})
