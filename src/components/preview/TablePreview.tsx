import type { ComponentPreviewProps } from './types'
import { textColor } from './types'

export function TablePreview({ primary, secondary, accent }: ComponentPreviewProps) {
  const data = [
    { name: 'Project Alpha', status: 'Active', users: 24 },
    { name: 'Project Beta', status: 'Pending', users: 12 },
    { name: 'Project Gamma', status: 'Completed', users: 48 },
    { name: 'Project Delta', status: 'Active', users: 8 },
  ]

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: primary, color: textColor(primary) }}>
            <th className="text-left px-4 py-3 font-medium">Project</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-right px-4 py-3 font-medium">Users</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.name} className="border-t border-neutral-100 transition-colors hover:bg-neutral-50">
              <td className="px-4 py-3">{row.name}</td>
              <td className="px-4 py-3">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: row.status === 'Active' ? secondary + '20' : accent + '20',
                    color: row.status === 'Active' ? secondary : accent,
                  }}
                >
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">{row.users}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
