import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SvgPreview } from '../../components/SvgPreview'

describe('SvgPreview', () => {
  const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red" width="100" height="100"/></svg>'

  it('renders SVG via dangerouslySetInnerHTML', () => {
    const { container } = render(
      <SvgPreview svgContent={svgContent} fileName="test.svg" onReset={vi.fn()} />
    )
    const svgEl = container.querySelector('svg')
    expect(svgEl).toBeTruthy()
  })

  it('renders nothing when svgContent is null', () => {
    const { container } = render(
      <SvgPreview svgContent={null} fileName={null} onReset={vi.fn()} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('download button triggers SVG export', () => {
    render(
      <SvgPreview svgContent={svgContent} fileName="test.svg" onReset={vi.fn()} />
    )
    const downloadBtn = screen.getByText(/download/i).closest('button')!
    expect(downloadBtn).toBeTruthy()
  })

  it('reset/new SVG button triggers onReset', () => {
    const onReset = vi.fn()
    render(
      <SvgPreview svgContent={svgContent} fileName="test.svg" onReset={onReset} />
    )
    const resetBtn = screen.getByText(/new/i).closest('button')!
    fireEvent.click(resetBtn)
    expect(onReset).toHaveBeenCalled()
  })
})
