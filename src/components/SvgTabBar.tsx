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
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          {svg.fileName}
          <span
            onClick={(e) => { e.stopPropagation(); onClose(svg.id) }}
            className="ml-2 cursor-pointer hover:text-red-500"
          >
            ×
          </span>
        </button>
      ))}
    </div>
  )
}
