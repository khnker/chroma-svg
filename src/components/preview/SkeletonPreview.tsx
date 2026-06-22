import type { ComponentPreviewProps } from './types'

export function SkeletonPreview({ primary, secondary, accent }: ComponentPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full" style={{ backgroundColor: primary + '25' }} />
        <div className="space-y-2 flex-1">
          <div className="h-4 rounded w-1/3" style={{ backgroundColor: primary + '20' }} />
          <div className="h-3 rounded w-1/4" style={{ backgroundColor: primary + '15' }} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-4 rounded w-full" style={{ backgroundColor: secondary + '20' }} />
        <div className="h-4 rounded w-5/6" style={{ backgroundColor: secondary + '18' }} />
        <div className="h-4 rounded w-4/6" style={{ backgroundColor: secondary + '15' }} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl p-4 space-y-3" style={{ border: `1px solid ${accent + '15'}` }}>
            <div className="h-24 rounded-lg w-full" style={{ backgroundColor: accent + '12' }} />
            <div className="h-3 rounded w-3/4" style={{ backgroundColor: accent + '15' }} />
            <div className="h-3 rounded w-1/2" style={{ backgroundColor: accent + '10' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
