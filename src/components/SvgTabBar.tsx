import { useState } from 'react'

interface SvgTabBarProps {
  svgs: { id: string; fileName: string; raw: string }[]
  activeId: string | null
  onSelect: (id: string) => void
  onClose: (id: string) => void
}

export function SvgTabBar({ svgs, activeId, onSelect, onClose }: SvgTabBarProps) {
  if (svgs.length <= 1) return null

  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="flex gap-2 overflow-x-auto py-2">
      {svgs.map((svg) => {
        const isActive = svg.id === activeId
        const isHovered = hoveredId === svg.id
        return (
          <div key={svg.id} className="relative shrink-0 pt-2 pr-2 pb-1 pl-1">
            <button
              onClick={() => onSelect(svg.id)}
              onMouseEnter={() => setHoveredId(svg.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`block w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer relative
                ${isActive ? 'border-primary-500 ring-1 ring-primary-200' : 'border-neutral-200 hover:border-neutral-300'}`}
            >
              <div
                className="w-full h-full flex items-center justify-center p-1"
                dangerouslySetInnerHTML={{ __html: svg.raw }}
              />
              {isHovered && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 rounded-[5px]">
                  <span className="text-white text-[10px] font-medium px-2 text-center leading-tight">
                    {svg.fileName.replace(/\.svg$/i, '')}
                  </span>
                </div>
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(svg.id) }}
              className={`absolute top-0 right-0 w-5 h-5 flex items-center justify-center rounded-full text-[10px] text-white transition-colors shadow-sm
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
