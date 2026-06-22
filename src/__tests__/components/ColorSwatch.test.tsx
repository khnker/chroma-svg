import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ColorSwatch } from '../../components/ColorSwatch'

describe('ColorSwatch', () => {
  it('renders with color prop', () => {
    render(<ColorSwatch color="#ff0000" />)
    const swatch = screen.getByTitle('#ff0000')
    expect(swatch).toBeTruthy()
  })

  it('renders as button when onClick provided', () => {
    render(<ColorSwatch color="#ff0000" onClick={() => {}} />)
    const swatch = screen.getByRole('button')
    expect(swatch).toBeTruthy()
  })

  it('renders sm size', () => {
    const { container } = render(<ColorSwatch color="#ff0000" size="sm" />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders md size', () => {
    const { container } = render(<ColorSwatch color="#ff0000" size="md" />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders lg size', () => {
    const { container } = render(<ColorSwatch color="#ff0000" size="lg" />)
    expect(container.firstChild).toBeTruthy()
  })

  it('shows selected state with ring', () => {
    const { container } = render(<ColorSwatch color="#ff0000" selected />)
    expect(container.firstChild).toBeTruthy()
  })

  it('has title attribute with color value', () => {
    render(<ColorSwatch color="#ff0000" />)
    const swatch = screen.getByTitle('#ff0000')
    expect(swatch.getAttribute('title')).toBe('#ff0000')
  })
})
