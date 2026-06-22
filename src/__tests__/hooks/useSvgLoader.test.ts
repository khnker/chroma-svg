import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSvgLoader } from '../../hooks/useSvgLoader'

describe('useSvgLoader', () => {
  beforeEach(() => {
    // Mock FileReader to be synchronous
    class MockFileReader {
      result: string | null = null
      onload: (() => void) | null = null
      onerror: (() => void) | null = null

      readAsText(_file: File) {
        this.result = _file.name === 'test.svg'
          ? '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red"/></svg>'
          : null
        queueMicrotask(() => this.onload?.())
      }
    }

    vi.stubGlobal('FileReader', MockFileReader)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads a mock File and calls onLoad', async () => {
    const onLoad = vi.fn()
    const { result } = renderHook(() => useSvgLoader({ onLoad }))
    const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red"/></svg>'
    const file = new File([svgContent], 'test.svg', { type: 'image/svg+xml' })

    await act(async () => {
      result.current.loadFile(file)
    })

    expect(onLoad).toHaveBeenCalledWith(svgContent, 'test.svg')
    expect(result.current.error).toBeNull()
  })

  it('sets error for non-svg file', () => {
    const { result } = renderHook(() => useSvgLoader())
    const file = new File(['not an svg'], 'test.txt', { type: 'text/plain' })

    act(() => {
      result.current.loadFile(file)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('loadRaw calls onLoad with raw string', () => {
    const onLoad = vi.fn()
    const { result } = renderHook(() => useSvgLoader({ onLoad }))

    act(() => {
      result.current.loadRaw('<svg><rect fill="red"/></svg>', 'raw.svg')
    })

    expect(onLoad).toHaveBeenCalledWith('<svg><rect fill="red"/></svg>', 'raw.svg')
    expect(result.current.error).toBeNull()
  })
})
