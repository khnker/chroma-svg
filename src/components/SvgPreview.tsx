import { useState } from 'react'

interface SvgPreviewProps {
  svgContent: string | null
  fileName: string | null
  onReset: () => void
  onColorClick?: (fill: string, e: React.MouseEvent<HTMLDivElement>) => void
}

export function SvgPreview({ svgContent, fileName, onReset, onColorClick }: SvgPreviewProps) {
  const [zoom, setZoom] = useState(1)

  if (!svgContent) return null

  const STYLE_FILL_RE = /fill\s*:\s*(#[0-9a-fA-F]{6})\b/
  const handleSvgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as Element
    let el: Element | null = target
    while (el && el !== e.currentTarget) {
      let fill = el.getAttribute('fill')
      if ((!fill || fill === 'none' || fill === 'transparent' || fill === 'currentColor') && el.getAttribute('style')) {
        const m = el.getAttribute('style')!.match(STYLE_FILL_RE)
        if (m) fill = m[1]
      }
      if (fill && fill !== 'none' && fill !== 'transparent' && fill !== 'currentColor' && fill.startsWith('#')) {
        onColorClick?.(fill.toLowerCase(), e)
        return
      }
      el = el.parentElement
    }
  }

  const handleDownload = () => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName ?? 'preview.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">{fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
            className="px-2 py-1 text-xs border rounded hover:bg-neutral-50"
          >
            -
          </button>
          <span className="text-xs text-neutral-500 w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="px-2 py-1 text-xs border rounded hover:bg-neutral-50"
          >
            +
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600"
          >
            Download
          </button>
          <button
            onClick={onReset}
            className="px-3 py-1 text-xs border border-red-200 text-red-500 rounded hover:bg-red-50"
          >
            New SVG
          </button>
        </div>
      </div>
      <div className="border rounded-xl p-4 bg-white flex items-center justify-center h-[600px] overflow-auto">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
          onClick={handleSvgClick}
          className="cursor-pointer"
        />
      </div>
    </div>
  )
}
