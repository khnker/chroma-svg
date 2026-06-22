import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePreview } from '../../hooks/usePreview'

describe('usePreview', () => {
  it('returns a memoized SVG string', () => {
    const rawSvg = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red"/></svg>'
    const colorMap = {}
    const { result } = renderHook(() => usePreview(rawSvg, colorMap))
    expect(result.current.previewSvg).toBeTruthy()
    expect(typeof result.current.previewSvg).toBe('string')
  })

  it('recalculates when rawSvg changes', () => {
    const colorMap = {}
    const { result, rerender } = renderHook(
      ({ rawSvg, colorMap }: { rawSvg: string; colorMap: Record<string, string> }) => usePreview(rawSvg, colorMap),
      { initialProps: { rawSvg: '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red"/></svg>', colorMap } }
    )
    const first = result.current.previewSvg
    rerender({ rawSvg: '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="blue"/></svg>', colorMap })
    expect(result.current.previewSvg).not.toBe(first)
  })

  it('recalculates when colorMap changes', () => {
    const rawSvg = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="#ff0000"/></svg>'
    const { result, rerender } = renderHook(
      ({ rawSvg, colorMap }: { rawSvg: string; colorMap: Record<string, string> }) => usePreview(rawSvg, colorMap),
      { initialProps: { rawSvg, colorMap: {} } }
    )
    const first = result.current.previewSvg
    rerender({ rawSvg, colorMap: { '#ff0000': '#00ff00' } })
    expect(result.current.previewSvg).not.toBe(first)
  })

  it('does NOT recalculate on unrelated re-renders', () => {
    const rawSvg = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red"/></svg>'
    const colorMap = {}
    const { result, rerender } = renderHook(
      ({ rawSvg, colorMap }: { rawSvg: string; colorMap: Record<string, string> }) => usePreview(rawSvg, colorMap),
      { initialProps: { rawSvg, colorMap } }
    )
    const first = result.current.previewSvg
    rerender({ rawSvg, colorMap })
    expect(result.current.previewSvg).toBe(first)
  })
})
