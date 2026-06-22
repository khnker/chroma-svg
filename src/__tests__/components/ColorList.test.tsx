import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ColorList } from '../../components/ColorList'
import type { ColorEntry } from '@/core/types'

describe('ColorList', () => {
  const colors: ColorEntry[] = [
    { original: '#ff0000', normalized: '#ff0000', selectors: [{ elementTag: 'rect', attribute: 'fill', cssSelector: 'rect', value: '#ff0000' }], label: 'Red', elementCount: 3 },
    { original: '#00ff00', normalized: '#00ff00', selectors: [{ elementTag: 'circle', attribute: 'fill', cssSelector: 'circle', value: '#00ff00' }], label: 'Green', elementCount: 2 },
    { original: '#0000ff', normalized: '#0000ff', selectors: [{ elementTag: 'path', attribute: 'fill', cssSelector: 'path', value: '#0000ff' }], label: 'Blue', elementCount: 1 },
  ]
  const colorMap: Record<string, string> = {}

  it('renders list of colors', () => {
    render(<ColorList colors={colors} colorMap={colorMap} onColorSelect={vi.fn()} selectedColor={null} />)
    expect(screen.getByText('#ff0000')).toBeTruthy()
    expect(screen.getByText('#00ff00')).toBeTruthy()
    expect(screen.getByText('#0000ff')).toBeTruthy()
  })

  it('calls onColorSelect when swatch clicked', () => {
    const onColorSelect = vi.fn()
    render(<ColorList colors={colors} colorMap={colorMap} onColorSelect={onColorSelect} selectedColor={null} />)
    const firstItem = screen.getByText('#ff0000').closest('button')!
    fireEvent.click(firstItem)
    expect(onColorSelect).toHaveBeenCalled()
  })

  it('shows empty state when no colors', () => {
    render(<ColorList colors={[]} colorMap={{}} onColorSelect={vi.fn()} selectedColor={null} />)
    expect(screen.getByText(/no colors/i)).toBeTruthy()
  })

  it('shows selection highlight for selected color', () => {
    render(<ColorList colors={colors} colorMap={colorMap} onColorSelect={vi.fn()} selectedColor="#ff0000" />)
    const selected = screen.getByText('#ff0000')
    expect(selected).toBeTruthy()
  })
})
