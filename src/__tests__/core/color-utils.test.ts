import { describe, it, expect } from 'vitest'
import { normalizeColor, isHexColor, hexToRgb, isLightColor } from '../../lib/color-utils'

describe('normalizeColor', () => {
  it('normalizes hex colors', () => {
    expect(normalizeColor('red')).toBe('#ff0000')
    expect(normalizeColor('#ff0000')).toBe('#ff0000')
  })

  it('returns null for invalid colors', () => {
    expect(normalizeColor('')).toBeNull()
    expect(normalizeColor('notacolor')).toBeNull()
  })
})

describe('isHexColor', () => {
  it('validates hex colors', () => {
    expect(isHexColor('#ff0000')).toBe(true)
    expect(isHexColor('#fff')).toBe(true)
    expect(isHexColor('red')).toBe(false)
    expect(isHexColor('#gggggg')).toBe(false)
  })
})

describe('hexToRgb', () => {
  it('converts hex to RGB', () => {
    const rgb = hexToRgb('#ff0000')
    expect(rgb).toEqual({ r: 255, g: 0, b: 0 })
  })
})

describe('isLightColor', () => {
  it('detects light colors', () => {
    expect(isLightColor('#ffffff')).toBe(true)
    expect(isLightColor('#000000')).toBe(false)
  })
})
