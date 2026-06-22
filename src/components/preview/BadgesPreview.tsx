import type { ComponentPreviewProps } from './types'

export function BadgesPreview({ primary, secondary, accent }: ComponentPreviewProps) {
  const badge = (label: string, bg: string) => (
    <span
      className="inline-flex px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: bg + '18', color: bg }}
    >
      {label}
    </span>
  )

  const pill = (label: string, bg: string) => (
    <span
      className="inline-flex px-3 py-1 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: bg }}
    >
      {label}
    </span>
  )

  const dot = (color: string) => (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      Online
    </span>
  )

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-400 mb-2">Soft Badges</p>
        <div className="flex flex-wrap gap-2">
          {badge('Primary', primary)}
          {badge('Secondary', secondary)}
          {badge('Accent', accent)}
          {badge('Info', '#3b82f6')}
          {badge('Success', '#22c55e')}
          {badge('Warning', '#eab308')}
          {badge('Error', '#ef4444')}
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-2">Solid Pills</p>
        <div className="flex flex-wrap gap-2">
          {pill('Primary', primary)}
          {pill('Secondary', secondary)}
          {pill('Accent', accent)}
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-2">Status Dots</p>
        <div className="flex flex-wrap gap-4">
          {dot(primary)}
          {dot(secondary)}
          {dot(accent)}
          {dot('#22c55e')}
        </div>
      </div>
    </div>
  )
}
