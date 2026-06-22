import { describe, it, expect, vi } from 'vitest'
import { applyColorMap, downloadSvg } from '../../core/color-replacer'

describe('applyColorMap', () => {
  it('returns SVG unchanged for empty colorMap', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="#ff0000" width="10" height="10"/></svg>'
    const result = applyColorMap(svg, {})
    expect(result).toBe(svg)
  })

  it('replaces fill="#ff0000" with new color', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="#ff0000" width="10" height="10"/></svg>'
    const result = applyColorMap(svg, { '#ff0000': '#00ff00' })
    expect(result).toContain('#00ff00')
    expect(result).not.toContain('#ff0000')
  })

  it('replaces stroke="#0000ff" with new stroke', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="4" stroke="#0000ff" fill="none"/></svg>'
    const result = applyColorMap(svg, { '#0000ff': '#ff0000' })
    expect(result).toContain('#ff0000')
    expect(result).not.toContain('#0000ff')
  })

  it('handles multiple replacements in one SVG', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="#ff0000" width="10" height="10"/><circle fill="#0000ff" cx="5" cy="5" r="4"/></svg>'
    const result = applyColorMap(svg, { '#ff0000': '#00ff00', '#0000ff': '#ffff00' })
    expect(result).toContain('#00ff00')
    expect(result).toContain('#ffff00')
    expect(result).not.toContain('#ff0000')
    expect(result).not.toContain('#0000ff')
  })
})

describe('downloadSvg', () => {
  it('creates a Blob with correct type and triggers download', () => {
    const createObjectURL = vi.fn(() => 'blob:mock')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })

    const appendChild = vi.fn()
    const removeChild = vi.fn()
    const click = vi.fn()
    const createElement = vi.fn(() => ({ click, remove: vi.fn() }))

    vi.stubGlobal('document', {
      createElement,
      body: { appendChild, removeChild },
    })

    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red"/></svg>'
    downloadSvg(svg, 'test.svg')

    expect(createElement).toHaveBeenCalledWith('a')
    expect(click).toHaveBeenCalled()

    vi.unstubAllGlobals()
  })
})
