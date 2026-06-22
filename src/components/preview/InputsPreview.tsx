import type { ComponentPreviewProps } from './types'

export function InputsPreview({ primary, secondary, accent }: ComponentPreviewProps) {
  const focusRing = (c: string) => ({
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = c
      e.currentTarget.style.boxShadow = `0 0 0 2px ${c}30`
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = '#d1d5db'
      e.currentTarget.style.boxShadow = 'none'
    },
  })

  return (
    <div className="space-y-4 max-w-sm">
      <div>
        <p className="text-xs text-gray-400 mb-2">Text Input</p>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Default input"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none transition-all"
            {...focusRing(primary)}
          />
          <input
            type="text"
            placeholder="With primary underline"
            className="w-full px-3 py-2 text-sm border-0 border-b-2 rounded-none outline-none transition-all"
            style={{ borderBottomColor: primary + '40' }}
            {...focusRing(primary)}
          />
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-2">Select</p>
        <select
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none transition-all"
          {...focusRing(secondary)}
        >
          <option>Option one</option>
          <option>Option two</option>
          <option>Option three</option>
        </select>
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-2">Textarea</p>
        <textarea
          rows={3}
          placeholder="Multi-line input..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none transition-all resize-none"
          {...focusRing(accent)}
        />
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-2">Checkboxes & Radios</p>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              defaultChecked
              className="rounded"
              style={{ accentColor: primary }}
            />
            Checked
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <input type="checkbox" className="rounded" style={{ accentColor: secondary }} />
            Unchecked
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <input
              type="radio"
              defaultChecked
              name="radio"
              className="rounded-full"
              style={{ accentColor: primary }}
            />
            Radio A
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <input type="radio" name="radio" className="rounded-full" style={{ accentColor: primary }} />
            Radio B
          </label>
        </div>
      </div>
    </div>
  )
}
