import type { ComponentPreviewProps } from './types'

export function CardsPreview({ primary, secondary, accent }: ComponentPreviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-xl p-4 border space-y-2" style={{ borderColor: primary + '40' }}>
        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: primary }} />
        <h4 className="text-sm font-semibold" style={{ color: primary }}>Primary Card</h4>
        <p className="text-xs text-neutral-500">Card with primary theme accent applied.</p>
        <button className="px-3 py-1 text-xs rounded-md text-white" style={{ backgroundColor: primary }}>
          Action
        </button>
      </div>
      <div className="rounded-xl p-4 border space-y-2" style={{ borderColor: secondary + '40' }}>
        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: secondary }} />
        <h4 className="text-sm font-semibold" style={{ color: secondary }}>Secondary Card</h4>
        <p className="text-xs text-neutral-500">Card with secondary theme accent.</p>
        <button className="px-3 py-1 text-xs rounded-md text-white" style={{ backgroundColor: secondary }}>
          Action
        </button>
      </div>
      <div className="rounded-xl p-4 border space-y-2" style={{ borderColor: accent + '40' }}>
        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: accent }} />
        <h4 className="text-sm font-semibold" style={{ color: accent }}>Accent Card</h4>
        <p className="text-xs text-neutral-500">Card with accent theme highlight.</p>
        <button className="px-3 py-1 text-xs rounded-md text-white" style={{ backgroundColor: accent }}>
          Action
        </button>
      </div>
    </div>
  )
}
