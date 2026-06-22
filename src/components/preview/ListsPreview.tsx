import type { ComponentPreviewProps } from './types'

export function ListsPreview({ primary, secondary }: ComponentPreviewProps) {
  return (
    <div className="space-y-4 max-w-sm">
      <div>
        <p className="text-xs text-gray-400 mb-1">Unordered List</p>
        <ul className="space-y-1 text-sm text-gray-700">
          {['First item with some content', 'Second item here', 'Third item'].map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: primary }} />
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-1">Description List</p>
        <dl className="text-sm space-y-2">
          <div className="flex gap-4">
            <dt className="w-20 font-medium" style={{ color: secondary }}>Email</dt>
            <dd className="text-gray-700">user@example.com</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-20 font-medium" style={{ color: secondary }}>Role</dt>
            <dd className="text-gray-700">Administrator</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-20 font-medium" style={{ color: secondary }}>Status</dt>
            <dd><span className="px-2 py-0.5 text-xs rounded-full text-white" style={{ backgroundColor: primary }}>Active</span></dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
