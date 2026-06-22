interface SvgTabBarProps {
  svgs: { id: string; fileName: string }[]
  activeId: string | null
  onSelect: (id: string) => void
  onClose: (id: string) => void
}

export function SvgTabBar({ svgs, activeId, onSelect, onClose }: SvgTabBarProps) {
  if (svgs.length <= 1) return null

  return (
    <div className="flex gap-1 overflow-x-auto">
      {svgs.map((svg) => (
        <button
          key={svg.id}
          onClick={() => onSelect(svg.id)}
          className={`px-3 py-1 text-xs rounded-full transition-colors whitespace-nowrap
            ${svg.id === activeId
              ? 'bg-primary-500 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
        >
          {svg.fileName}
          <span
            onClick={(e) => { e.stopPropagation(); onClose(svg.id) }}
            className="ml-1.5 w-4 h-4 inline-flex items-center justify-center rounded-full text-[10px] hover:bg-black/10 hover:text-red-500 transition-colors"
          >
            ✕
          </span>
        </button>
      ))}
    </div>
  )
}
