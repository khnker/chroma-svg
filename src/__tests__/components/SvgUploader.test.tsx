import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SvgUploader } from '../../components/SvgUploader'

describe('SvgUploader', () => {
  it('renders upload zone', () => {
    render(<SvgUploader onFile={vi.fn()} hasFile={false} />)
    expect(screen.getByText(/drop an svg/i)).toBeTruthy()
  })

  it('click triggers hidden file input', () => {
    const { container } = render(<SvgUploader onFile={vi.fn()} hasFile={false} />)
    const zone = screen.getByText(/drop an svg/i).closest('div')!
    fireEvent.click(zone)
    const fileInput = container.querySelector('input[type="file"]')
    expect(fileInput).toBeTruthy()
  })

  it('passes file on drop', () => {
    const onFile = vi.fn()
    render(<SvgUploader onFile={onFile} hasFile={false} />)
    const zone = screen.getByText(/drop an svg/i).closest('div')!
    const file = new File(['<svg/>'], 'test.svg', { type: 'image/svg+xml' })
    fireEvent.drop(zone, { dataTransfer: { files: [file] } })
    expect(onFile).toHaveBeenCalledWith(file)
  })
})
