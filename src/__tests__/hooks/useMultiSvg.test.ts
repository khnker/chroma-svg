import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMultiSvg } from '../../hooks/useMultiSvg'

describe('useMultiSvg', () => {
  it('starts with empty svgs array', () => {
    const { result } = renderHook(() => useMultiSvg())
    expect(result.current.svgs).toEqual([])
  })

  it('addSvg adds to array and sets active to new index', () => {
    const { result } = renderHook(() => useMultiSvg())
    act(() => { result.current.addSvg('<svg/>', 'test.svg') })
    expect(result.current.svgs.length).toBe(1)
    expect(result.current.activeIndex).toBe(0)
  })

  it('addSvg when already populated sets active to last index', () => {
    const { result } = renderHook(() => useMultiSvg())
    act(() => { result.current.addSvg('<svg/>', 'first.svg') })
    act(() => { result.current.addSvg('<svg/>', 'second.svg') })
    expect(result.current.activeIndex).toBe(1)
  })

  it('removeSvg of last item results in empty', () => {
    const { result } = renderHook(() => useMultiSvg())
    act(() => { result.current.addSvg('<svg/>', 'only.svg') })
    const id = result.current.svgs[0].id
    act(() => { result.current.removeSvg(id) })
    expect(result.current.svgs).toEqual([])
    expect(result.current.activeIndex).toBe(-1)
  })

  it('removeSvg of active item when not last decrements activeIndex', () => {
    const { result } = renderHook(() => useMultiSvg())
    act(() => { result.current.addSvg('<svg/>', 'first.svg') })
    act(() => { result.current.addSvg('<svg/>', 'second.svg') })
    act(() => { result.current.addSvg('<svg/>', 'third.svg') })
    const thirdId = result.current.svgs[2].id
    act(() => { result.current.setActive(thirdId) })
    act(() => { result.current.removeSvg(thirdId) })
    expect(result.current.activeIndex).toBe(1)
  })

  it('setActive changes activeIndex', () => {
    const { result } = renderHook(() => useMultiSvg())
    act(() => { result.current.addSvg('<svg/>', 'first.svg') })
    act(() => { result.current.addSvg('<svg/>', 'second.svg') })
    const firstId = result.current.svgs[0].id
    act(() => { result.current.setActive(firstId) })
    expect(result.current.activeIndex).toBe(0)
  })

  it('renameSvg updates fileName by id', () => {
    const { result } = renderHook(() => useMultiSvg())
    act(() => { result.current.addSvg('<svg/>', 'old.svg') })
    const id = result.current.svgs[0].id
    act(() => { result.current.renameSvg(id, 'new.svg') })
    expect(result.current.svgs[0].fileName).toBe('new.svg')
  })
})
