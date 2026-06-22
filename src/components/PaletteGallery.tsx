import { useState } from 'react'
import type { PaletteGalleryItem } from '@/hooks/usePaletteGallery'

interface PaletteGalleryProps {
  galleries: PaletteGalleryItem[]
  onApplyPalette: (colors: string[]) => void
}

export function PaletteGallery({ galleries, onApplyPalette }: PaletteGalleryProps) {
  if (galleries.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400 text-sm">
        Load an SVG to see palette previews
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-400">
        Preview your SVG rendered with different color palettes
      </p>
      <div className="grid grid-cols-2 gap-3">
        {galleries.map((g) => (
          <GalleryCard key={g.id} item={g} onApply={onApplyPalette} />
        ))}
      </div>
    </div>
  )
}

function GalleryCard({
  item,
  onApply,
}: {
  item: PaletteGalleryItem
  onApply: (colors: string[]) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="rounded-lg border border-neutral-200 overflow-hidden hover:border-neutral-300 hover:shadow-sm transition-all"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="bg-neutral-50 p-3 flex items-center justify-center h-32 overflow-hidden relative">
        {item.previewSvg && (
          <div
            className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
            dangerouslySetInnerHTML={{ __html: item.previewSvg }}
          />
        )}
        {hovered && (
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
            <button
              onClick={() => onApply(item.paletteColors)}
              className="px-4 py-2 text-xs bg-white text-neutral-800 rounded-lg shadow-md font-medium hover:bg-neutral-50"
            >
              Apply 🎲
            </button>
          </div>
        )}
      </div>
      <div className="p-2.5">
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
      </div>
    </div>
  )
}
