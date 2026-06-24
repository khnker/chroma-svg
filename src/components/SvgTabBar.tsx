import { useState } from 'react'

interface SvgTabBarProps {
  svgs: { id: string; fileName: string; raw: string }[]
  activeId: string | null
  onSelect: (id: string) => void
  onClose: (id: string) => void
}

export function SvgTabBar({ svgs, activeId, onSelect, onClose }: SvgTabBarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (svgs.length === 0) return null

  return (
    <div className="flex gap-1.5">
      {svgs.map((svg) => {
        const isActive = svg.id === activeId
        const isHovered = hoveredId === svg.id
        return (
          <div key={svg.id} className="relative shrink-0">
            <button
              onClick={() => onSelect(svg.id)}
              onMouseEnter={() => setHoveredId(svg.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`block w-9 h-9 rounded-lg overflow-hidden border transition-all cursor-pointer relative
                ${isActive ? 'border-primary-500 ring-1 ring-primary-200' : 'border-neutral-200 hover:border-neutral-300'}`}
            >
              <div
                className="w-full h-full flex items-center justify-center p-0.5"
                dangerouslySetInnerHTML={{ __html: svg.raw }}
              />
              {isHovered && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 rounded-[5px]">
                  <span className="text-white text-[9px] font-medium px-1 text-center leading-tight">
                    {svg.fileName.replace(/\.svg$/i, '')}
                  </span>
                </div>
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(svg.id) }}
              className={`absolute top-0.5 right-0.5 z-20 w-4 h-4 flex items-center justify-center rounded-full text-[8px] text-white transition-colors shadow-sm opacity-80 hover:opacity-100
                ${isActive ? 'bg-primary-500 hover:bg-primary-600' : 'bg-neutral-400 hover:bg-red-500'}`}
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
