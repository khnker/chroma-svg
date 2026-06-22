import type { ComponentPreviewProps } from './types'

export function AlertsPreview({ primary, secondary, accent }: ComponentPreviewProps) {
  const alert = (title: string, msg: string, bg: string) => (
    <div
      className="rounded-lg p-3 border-l-4 space-y-1"
      style={{ backgroundColor: bg + '10', borderLeftColor: bg }}
    >
      <p className="text-sm font-medium" style={{ color: bg }}>{title}</p>
      <p className="text-xs text-neutral-500">{msg}</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {alert('Primary Notice', 'This is an informational message using the primary theme color.', primary)}
      {alert('Secondary Info', 'A secondary-style alert with softer visual weight.', secondary)}
      {alert('Accent Highlight', 'Using the accent color for attention-grabbing messages.', accent)}

      <div className="flex flex-wrap gap-2 pt-2">
        {[
          { label: 'Info', color: '#3b82f6' },
          { label: 'Success', color: '#22c55e' },
          { label: 'Warning', color: '#eab308' },
          { label: 'Error', color: '#ef4444' },
        ].map(({ label, color }) => (
          <div
            key={label}
            className="flex-1 min-w-[100px] rounded-lg p-2 text-center"
            style={{ backgroundColor: color + '12' }}
          >
            <span className="text-xs font-medium" style={{ color }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
