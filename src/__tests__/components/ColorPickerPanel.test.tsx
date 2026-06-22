import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ColorPickerPanel } from '../../components/ColorPickerPanel'

describe('ColorPickerPanel', () => {
  it('renders hex input and picker', () => {
    render(<ColorPickerPanel original="#ff0000" current="#ff0000" onChange={vi.fn()} onReset={vi.fn()} />)
    const input = screen.getByDisplayValue('#ff0000')
    expect(input).toBeTruthy()
  })

  it('typing valid hex calls onChange', () => {
    const onChange = vi.fn()
    render(<ColorPickerPanel original="#ff0000" current="#ff0000" onChange={onChange} onReset={vi.fn()} />)
    const input = screen.getByDisplayValue('#ff0000')
    fireEvent.change(input, { target: { value: '#00ff00' } })
    expect(onChange).toHaveBeenCalledWith('#00ff00')
  })

  it('typing invalid hex does not call onChange', () => {
    const onChange = vi.fn()
    render(<ColorPickerPanel original="#ff0000" current="#ff0000" onChange={onChange} onReset={vi.fn()} />)
    const input = screen.getByDisplayValue('#ff0000')
    fireEvent.change(input, { target: { value: '#gggggg' } })
    expect(onChange).not.toHaveBeenCalledWith('#gggggg')
  })

  it('reset button calls onReset when modified', () => {
    const onReset = vi.fn()
    render(<ColorPickerPanel original="#ff0000" current="#00ff00" onChange={vi.fn()} onReset={onReset} />)
    const resetBtn = screen.getByText(/reset/i)
    fireEvent.click(resetBtn)
    expect(onReset).toHaveBeenCalled()
  })
})
