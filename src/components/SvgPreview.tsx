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
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500 font-mono">{fileName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
            className="px-2 py-1 text-xs border border-neutral-200 rounded hover:bg-neutral-50 text-neutral-500"
          >
            -
          </button>
          <span className="text-xs text-neutral-400 font-mono w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="px-2 py-1 text-xs border border-neutral-200 rounded hover:bg-neutral-50 text-neutral-500"
          >
            +
          </button>
          <div className="w-px h-5 bg-neutral-200 mx-1" />
          <button
            onClick={handleDownload}
            className="px-3 py-1 text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
          >
            Download
          </button>
          <button
            onClick={onReset}
            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="p-4 bg-neutral-50 flex items-center justify-center h-[560px] overflow-auto">
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
