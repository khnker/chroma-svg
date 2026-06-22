import type { ComponentPreviewProps } from './types'

export function ProgressPreview({ primary, secondary, accent }: ComponentPreviewProps) {
  return (
    <div className="space-y-5 max-w-sm">
      <div>
        <p className="text-xs text-gray-400 mb-2">Determinate Progress</p>
        <div className="space-y-3">
          {[
            { label: 'Primary', pct: 75, c: primary },
            { label: 'Secondary', pct: 50, c: secondary },
            { label: 'Accent', pct: 30, c: accent },
          ].map(({ label, pct, c }) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{label}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: c }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-2">Indeterminate (Loading Bar)</p>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full w-1/3 animate-pulse"
            style={{ backgroundColor: primary }}
          />
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-2">Spinning Loaders</p>
        <div className="flex gap-4">
          {['sm', 'md', 'lg'].map((size) => {
            const dim = size === 'sm' ? 16 : size === 'md' ? 24 : 32
            const border = size === 'sm' ? 2 : size === 'md' ? 3 : 4
            return (
              <div
                key={size}
                className="rounded-full animate-spin"
                style={{
                  width: dim,
                  height: dim,
                  borderWidth: border,
                  borderStyle: 'solid',
                  borderColor: primary + '20',
                  borderTopColor: primary,
                }}
              />
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-2">Steps / Stepper</p>
        <div className="flex items-center justify-between max-w-xs">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center gap-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white"
                style={{ backgroundColor: step <= 2 ? primary : '#d1d5db' }}
              >
                {step <= 2 ? '✓' : step}
              </div>
              {step < 4 && (
                <div className="w-8 h-0.5" style={{ backgroundColor: step <= 2 ? primary : '#e5e7eb' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
