import type { FC } from 'react'
import type { ComponentPreviewProps } from './preview/types'
import { ButtonsPreview, CardsPreview, TablePreview, BadgesPreview, InputsPreview, AlertsPreview, NavigationPreview, ProgressPreview, SkeletonPreview, TypographyPreview, ListsPreview, TabsPreview, StatsPreview } from './preview'

const SECTIONS: { id: string; label: string; Component: FC<ComponentPreviewProps> }[] = [
  { id: 'buttons', label: 'Buttons', Component: ButtonsPreview },
  { id: 'cards', label: 'Cards', Component: CardsPreview },
  { id: 'table', label: 'Table', Component: TablePreview },
  { id: 'badges', label: 'Badges', Component: BadgesPreview },
  { id: 'inputs', label: 'Inputs', Component: InputsPreview },
  { id: 'alerts', label: 'Alerts', Component: AlertsPreview },
  { id: 'navigation', label: 'Nav', Component: NavigationPreview },
  { id: 'progress', label: 'Progress', Component: ProgressPreview },
  { id: 'skeleton', label: 'Skeleton', Component: SkeletonPreview },
  { id: 'typography', label: 'Typography', Component: TypographyPreview },
  { id: 'lists', label: 'Lists', Component: ListsPreview },
  { id: 'tabs', label: 'Tabs', Component: TabsPreview },
  { id: 'stats', label: 'Stats', Component: StatsPreview },
]

export function ComponentPreview({ primary, secondary, accent }: ComponentPreviewProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Theme Preview</h3>
        <div className="flex gap-2">
          {[
            { label: 'Primary', color: primary },
            { label: 'Secondary', color: secondary },
            { label: 'Accent', color: accent },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded border border-gray-200" style={{ backgroundColor: c.color }} />
              <span className="text-xs text-gray-400">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {SECTIONS.map(({ id, label, Component }) => (
          <section key={id}>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">{label}</h4>
            <Component primary={primary} secondary={secondary} accent={accent} />
          </section>
        ))}
      </div>
    </div>
  )
}
