import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SvgPreview } from '../../components/SvgPreview'

describe('SvgPreview', () => {
  const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red" width="100" height="100"/></svg>'

  it('renders SVG via dangerouslySetInnerHTML', () => {
    const { container } = render(
      <SvgPreview svgContent={svgContent} />
    )
    const svgEl = container.querySelector('svg')
    expect(svgEl).toBeTruthy()
  })

  it('renders nothing when svgContent is null', () => {
    const { container } = render(
      <SvgPreview svgContent={null} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders zoom controls', () => {
    const { container } = render(
      <SvgPreview svgContent={svgContent} />
    )
    expect(container.querySelector('button')?.textContent).toBe('-')
  })
})
