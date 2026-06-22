import type { ComponentPreviewProps } from './types'
import { textColor } from './types'

export function ButtonsPreview({ primary, secondary, accent }: ComponentPreviewProps) {
  const btn = (label: string, bg: string, txt?: string) => (
    <button
      className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
      style={{ backgroundColor: bg, color: txt ?? textColor(bg) }}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-400 mb-2">Solid</p>
        <div className="flex flex-wrap gap-3">
          {btn('Primary', primary)}
          {btn('Secondary', secondary)}
          {btn('Accent', accent)}
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-2">Outlined</p>
        <div className="flex flex-wrap gap-3">
          {['Primary', 'Secondary', 'Accent'].map((label, i) => {
            const c = [primary, secondary, accent][i]
            return (
              <button
                key={label}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-transparent"
                style={{ border: `1.5px solid ${c}`, color: c }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-2">Ghost</p>
        <div className="flex flex-wrap gap-3">
          {['Primary', 'Secondary', 'Accent'].map((label, i) => {
            const c = [primary, secondary, accent][i]
            return (
              <button
                key={label}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ color: c, backgroundColor: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = c + '18' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-2">Sizes</p>
        <div className="flex items-end gap-3">
          {['sm', 'md', 'lg'].map((size) => (
            <button
              key={size}
              className={`rounded-lg text-white font-medium transition-opacity hover:opacity-90 ${
                size === 'sm' ? 'px-3 py-1 text-xs' : size === 'md' ? 'px-4 py-2 text-sm' : 'px-5 py-3 text-base'
              }`}
              style={{ backgroundColor: primary }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
