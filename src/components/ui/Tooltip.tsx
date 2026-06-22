interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div
        className={`absolute z-40 pointer-events-none px-2 py-1 text-xs text-white bg-gray-800 rounded
          whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity
          ${positionStyles[position]}`}
      >
        {content}
      </div>
    </div>
  )
}
