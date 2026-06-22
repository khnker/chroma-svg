import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useColorMap } from '../../hooks/useColorMap'

describe('useColorMap', () => {
  it('uses passed initial colorMap', () => {
    const initial = { '#ff0000': '#00ff00' }
    const { result } = renderHook(() => useColorMap(initial))
    expect(result.current.colorMap).toEqual(initial)
  })

  it('updateColor(key, value) updates the map', () => {
    const { result } = renderHook(() => useColorMap())
    act(() => { result.current.updateColor('#ff0000', '#00ff00') })
    expect(result.current.colorMap['#ff0000']).toBe('#00ff00')
  })

  it('resetColor(key) removes the entry', () => {
    const initial = { '#ff0000': '#00ff00' }
    const { result } = renderHook(() => useColorMap(initial))
    act(() => { result.current.resetColor('#ff0000') })
    expect(result.current.colorMap['#ff0000']).toBeUndefined()
  })

  it('resetAll() clears the map', () => {
    const initial = { '#ff0000': '#00ff00', '#0000ff': '#ffff00' }
    const { result } = renderHook(() => useColorMap(initial))
    act(() => { result.current.resetAll() })
    expect(Object.keys(result.current.colorMap).length).toBe(0)
  })

  it('applyPalette merges entries', () => {
    const initial = { '#ff0000': '#00ff00' }
    const { result } = renderHook(() => useColorMap(initial))
    act(() => { result.current.applyPalette([{ original: '#0000ff', replacement: '#ffff00' }]) })
    expect(result.current.colorMap['#ff0000']).toBe('#00ff00')
    expect(result.current.colorMap['#0000ff']).toBe('#ffff00')
  })

  it('undo restores previous state after updateColor', () => {
    const { result } = renderHook(() => useColorMap())
    act(() => { result.current.updateColor('#ff0000', '#00ff00') })
    expect(result.current.colorMap['#ff0000']).toBe('#00ff00')
    expect(result.current.canUndo).toBe(true)
    act(() => { result.current.undo() })
    expect(result.current.colorMap['#ff0000']).toBeUndefined()
  })

  it('redo reapplies change after undo', () => {
    const { result } = renderHook(() => useColorMap())
    act(() => { result.current.updateColor('#ff0000', '#00ff00') })
    act(() => { result.current.undo() })
    expect(result.current.canRedo).toBe(true)
    act(() => { result.current.redo() })
    expect(result.current.colorMap['#ff0000']).toBe('#00ff00')
  })

  it('canUndo/canRedo flags update correctly', () => {
    const { result } = renderHook(() => useColorMap())
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
    act(() => { result.current.updateColor('#ff0000', '#00ff00') })
    expect(result.current.canUndo).toBe(true)
    act(() => { result.current.undo() })
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)
  })

  it('updateColor after undo discards redo stack', () => {
    const { result } = renderHook(() => useColorMap())
    act(() => { result.current.updateColor('#ff0000', '#00ff00') })
    act(() => { result.current.undo() })
    expect(result.current.canRedo).toBe(true)
    act(() => { result.current.updateColor('#ff0000', '#0000ff') })
    expect(result.current.canRedo).toBe(false)
  })
})
