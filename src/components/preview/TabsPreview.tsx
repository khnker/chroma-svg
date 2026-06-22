import type { ComponentPreviewProps } from './types'

export function TabsPreview({ primary, secondary: _secondary }: ComponentPreviewProps) {
  const tabs = ['Tab A', 'Tab B', 'Tab C']
  return (
    <div className="space-y-3 max-w-md">
      <p className="text-xs text-neutral-400 mb-1">Tabs / Pills</p>
      <div className="flex gap-1 border-b border-neutral-200">
        {tabs.map((t, i) => (
          <button
            key={t}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${i === 0 ? '' : 'text-neutral-500 border-transparent hover:text-neutral-700'}`}
            style={i === 0 ? { color: primary, borderColor: primary } : undefined}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {tabs.map((t, i) => (
          <span
            key={t}
            className="px-3 py-1 text-xs rounded-full font-medium"
            style={i === 0 ? { backgroundColor: primary + '15', color: primary } : { backgroundColor: '#f3f4f6', color: '#6b7280' }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

export function StatsPreview({ primary, secondary, accent }: ComponentPreviewProps) {
  const stats = [
    { label: 'Users', value: '2,847', color: primary },
    { label: 'Revenue', value: '$48.2K', color: secondary },
    { label: 'Orders', value: '1,023', color: accent },
  ]
  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-400 mb-1">Stats</p>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border p-3 text-center" style={{ borderColor: s.color + '30' }}>
            <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
