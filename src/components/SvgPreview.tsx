import { useState } from 'react'

interface SvgPreviewProps {
  svgContent: string | null
  fileName: string | null
  onReset: () => void
  onColorClick?: (fill: string, e: React.MouseEvent<HTMLDivElement>) => void
  bgMode?: 'checker' | 'white' | 'black'
  onBgModeChange?: (mode: 'checker' | 'white' | 'black') => void
}

export function SvgPreview({ svgContent, fileName, onReset, onColorClick, bgMode = 'checker', onBgModeChange }: SvgPreviewProps) {
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
          <div className="flex items-center gap-1 mr-1">
            {(['white', 'checker', 'black'] as const).map(m => (
              <button
                key={m}
                onClick={() => onBgModeChange?.(m)}
                className={`w-5 h-5 rounded-full border border-neutral-300 text-[9px] font-bold flex items-center justify-center transition-all ${bgMode === m ? 'ring-2 ring-primary-400 ring-offset-1' : ''}`}
                style={{
                  background: m === 'white' ? '#fff' : m === 'black' ? '#222' : 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 6px 6px',
                  color: m === 'black' ? '#fff' : '#666'
                }}
                title={m === 'checker' ? 'Transparent (checkerboard)' : m === 'white' ? 'White background' : 'Black background'}
              >
                {m === 'white' ? 'W' : m === 'black' ? 'B' : 'T'}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-neutral-200" />
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
            className="px-3 py-1 text-xs font-medium text-white bg-accent-500 hover:bg-accent-600 rounded-lg transition-colors"
          >
            Download
          </button>
          <button
            onClick={onReset}
            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors ring-1 ring-red-200/50"
          >
            Reset
          </button>
        </div>
      </div>
      <div
        className="p-4 flex items-center justify-center h-[560px] overflow-auto"
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
