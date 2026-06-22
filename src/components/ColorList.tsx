import type { ColorEntry, ColorMap } from '@/core/types'

interface ColorListProps {
  colors: ColorEntry[]
  colorMap: ColorMap
  onColorSelect: (entry: ColorEntry, e: React.MouseEvent) => void
  selectedColor: string | null
}

export function ColorList({ colors, colorMap, onColorSelect, selectedColor }: ColorListProps) {
  if (colors.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400 text-sm">
        No colors detected
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {colors.map((entry) => {
        const currentColor = colorMap[entry.original] ?? entry.normalized
        const isSelected = selectedColor === entry.normalized

        return (
          <button
            key={entry.normalized}
            onClick={(e) => onColorSelect(entry, e)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono transition-colors
              ${isSelected
                ? 'bg-primary-50 ring-1 ring-primary-200 text-primary-700'
                : 'text-neutral-600 hover:bg-neutral-100 border border-transparent'}`}
          >
            <span
              className="w-3.5 h-3.5 rounded-sm border border-neutral-200 shrink-0"
              style={{ backgroundColor: currentColor }}
            />
            <span>{currentColor}</span>
          </button>
        )
      })}
    </div>
  )
}
