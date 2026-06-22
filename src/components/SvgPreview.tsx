import { useState } from 'react'

interface SvgPreviewProps {
  svgContent: string | null
  onColorClick?: (fill: string, e: React.MouseEvent<HTMLDivElement>) => void
  bgMode?: 'checker' | 'white' | 'black'
}

export function SvgPreview({ svgContent, onColorClick, bgMode = 'checker' }: SvgPreviewProps) {
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

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-end px-4 py-1.5 border-b border-neutral-100">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
            className="h-7 px-2 text-xs border border-neutral-200 rounded hover:bg-neutral-50 text-neutral-500"
          >
            -
          </button>
          <span className="text-xs text-neutral-400 font-mono w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="h-7 px-2 text-xs border border-neutral-200 rounded hover:bg-neutral-50 text-neutral-500"
          >
            +
          </button>
        </div>
      </div>
      <div
        className="flex items-center justify-center h-[560px] overflow-auto"
        style={{
          background: bgMode === 'white' ? '#ffffff'
            : bgMode === 'black' ? '#111111'
            : 'repeating-conic-gradient(#e0e0e0 0% 25%, #ffffff 0% 50%) 50% / 20px 20px'
        }}
      >
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
