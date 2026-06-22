import { useRef, useCallback, useState, useEffect } from 'react'
import type { PaletteGalleryItem } from '@/hooks/usePaletteGallery'

interface PaletteGalleryProps {
  galleries: PaletteGalleryItem[]
  onApplyPalette: (colors: string[]) => void
  selectedPalette?: string[] | null
}

const CARD_HEIGHT = 220
const BUFFER_ROWS = 2
const COLUMNS = 2

export function PaletteGallery({ galleries, onApplyPalette, selectedPalette }: PaletteGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 })

  const updateRange = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const scrollTop = el.scrollTop
    const clientHeight = el.clientHeight
    const rowHeight = CARD_HEIGHT + 12
    const totalRows = Math.ceil(galleries.length / COLUMNS)
    const visibleRows = Math.ceil(clientHeight / rowHeight)
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - BUFFER_ROWS)
    const endRow = Math.min(totalRows, Math.ceil((scrollTop + clientHeight) / rowHeight) + BUFFER_ROWS)
    setVisibleRange({ start: startRow * COLUMNS, end: Math.min(galleries.length, endRow * COLUMNS) })
  }, [galleries.length])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('scroll', updateRange, { passive: true })
    updateRange()
    return () => el.removeEventListener('scroll', updateRange)
  }, [updateRange])

  useEffect(() => { updateRange() }, [galleries.length, updateRange])

  if (galleries.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400 text-sm">
        Load an SVG to see palette previews
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-[500px] overflow-y-auto">
      <p className="text-xs text-neutral-400 mb-3">
        {galleries.length} previews &middot; scroll to explore
      </p>
      <div className="grid grid-cols-2 gap-3">
        {galleries.slice(visibleRange.start, visibleRange.end).map((g) => (
          <GalleryCard key={g.id} item={g} onApply={onApplyPalette} selectedPalette={selectedPalette} />
        ))}
      </div>
    </div>
  )
}

function GalleryCard({
  item,
  onApply,
  selectedPalette,
}: {
  item: PaletteGalleryItem
  onApply: (colors: string[]) => void
  selectedPalette?: string[] | null
}) {
  const [hovered, setHovered] = useState(false)

  const sel = selectedPalette !== null && selectedPalette !== undefined &&
    selectedPalette.length === item.paletteColors.length &&
    selectedPalette.every((c, i) => c.toLowerCase() === item.paletteColors[i].toLowerCase())

  return (
    <div
      className={`rounded-xl border bg-white shadow-sm overflow-hidden transition-all flex flex-col cursor-pointer
        ${sel
          ? 'ring-2 ring-primary-500 border-primary-300 shadow-md'
          : 'border-neutral-200 hover:border-neutral-300 hover:shadow-md'}`}
      style={{ height: CARD_HEIGHT }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onApply(item.paletteColors)}
    >
      <div className="bg-neutral-50 p-3 flex items-center justify-center flex-1 overflow-hidden relative min-h-0">
        {item.previewSvg && (
          <div
            className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
            dangerouslySetInnerHTML={{ __html: item.previewSvg }}
          />
        )}
        {sel && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {hovered && !sel && (
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
            <span className="px-3 py-1 text-xs bg-white text-neutral-800 rounded-lg shadow-md font-medium">
              Click to apply
            </span>
          </div>
        )}
      </div>
      <div className="p-2.5 shrink-0">
        <h4 className="text-xs font-medium text-neutral-800 truncate">{item.name}</h4>
        <p className="text-[10px] text-neutral-400 truncate">{item.description}</p>
        <div className="flex gap-0.5 mt-1.5">
          {item.paletteColors.map((c, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full first:rounded-l-full last:rounded-r-full"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        {sel && (
          <p className="text-[9px] text-primary-600 font-medium mt-1">Click to re-apply &middot; colors rotate</p>
        )}
      </div>
    </div>
  )
}
