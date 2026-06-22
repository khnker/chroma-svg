import { describe, it, expect } from 'vitest'
import { extractDominantColors } from '../../components/SvgUploader'

function makeImageData(pixels: number[][], width = 4, height = 4): ImageData {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const px = pixels[y * width + x] || [128, 128, 128, 255]
      data[i] = px[0]
      data[i + 1] = px[1]
      data[i + 2] = px[2]
      data[i + 3] = px[3] ?? 255
    }
  }
  return { data, width, height, colorSpace: 'srgb' } as ImageData
}

describe('extractDominantColors', () => {
  it('returns hex colors from image data', () => {
    const pixels = Array.from({ length: 16 }, () => [255, 0, 0, 255])
    const result = extractDominantColors(makeImageData(pixels))
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('handles single color images', () => {
    const red = Array.from({ length: 16 }, () => [255, 0, 0, 255])
    const result = extractDominantColors(makeImageData(red))
    expect(result.some(c => c.toLowerCase() === '#ff0000')).toBe(true)
  })

  it('returns fallback for transparent images', () => {
    const transparent = Array.from({ length: 16 }, () => [0, 0, 0, 0])
    const result = extractDominantColors(makeImageData(transparent))
    expect(result).toEqual(['#808080'])
  })
})
