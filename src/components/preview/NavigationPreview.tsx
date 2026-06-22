import type { ComponentPreviewProps } from './types'

export function NavigationPreview({ primary }: ComponentPreviewProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-neutral-400 mb-2">Tabs</p>
        <div className="flex border-b border-neutral-200">
          {['Home', 'Profile', 'Settings', 'Billing'].map((label, i) => (
            <button
              key={label}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                i === 0 ? '' : 'text-neutral-500 hover:text-neutral-700'
              }`}
              style={{
                borderBottomColor: i === 0 ? primary : 'transparent',
                color: i === 0 ? primary : undefined,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-neutral-400 mb-2">Breadcrumbs</p>
        <nav className="flex items-center gap-1.5 text-xs">
          {['Home', 'Projects', 'Design'].map((label, i) => (
            <span key={label} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-neutral-300">/</span>}
              <span
                className={i === 2 ? 'font-medium' : 'text-neutral-500'}
                style={i === 2 ? { color: primary } : undefined}
              >
                {label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div>
        <p className="text-xs text-neutral-400 mb-2">Sidebar Links</p>
        <div className="space-y-1 max-w-[160px]">
          {[
            { label: 'Dashboard', active: true },
            { label: 'Analytics', active: false },
            { label: 'Reports', active: false },
            { label: 'Settings', active: false },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors"
              style={{
                backgroundColor: item.active ? primary + '12' : undefined,
                color: item.active ? primary : '#374151',
                fontWeight: item.active ? 500 : 400,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-neutral-400 mb-2">Pagination</p>
        <div className="flex items-center gap-1">
          {['«', '1', '2', '3', '...', '8', '»'].map((label) => {
            const isActive = label === '1'
            return (
              <button
                key={label}
                className={`w-8 h-8 text-xs rounded transition-colors ${
                  isActive ? 'text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
                style={isActive ? { backgroundColor: primary } : undefined}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
