import { generateTailwindTokens, downloadCssTokens } from '../core/color-replacer'
import { ComponentPreview } from './ComponentPreview'
import type { ColorMap } from '../core/types'

interface ThemePreviewProps {
  colorMap: ColorMap
  svgName?: string
}

export function ThemePreview({ colorMap, svgName = 'colors' }: ThemePreviewProps) {
  const entries = Object.entries(colorMap).filter(([, v]) => v)
  const colors = entries.map(([, v]) => v)
  const [primary, secondary, accent] = colors
  const css = generateTailwindTokens(colorMap)

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100">
        <span className="text-sm text-neutral-500 font-mono">{svgName}-tokens.css</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigator.clipboard.writeText(css)}
            className="px-3 py-1 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Copy CSS
          </button>
          <button
            onClick={() => downloadCssTokens(colorMap, svgName)}
            className="px-3 py-1 text-xs font-medium text-white bg-accent-500 hover:bg-accent-600 rounded-lg transition-colors"
          >
            Download CSS
          </button>
        </div>
      </div>
      <div className="p-4 h-[560px] overflow-y-auto">
        {primary && secondary && accent ? (
          <ComponentPreview primary={primary} secondary={secondary} accent={accent} />
        ) : (
          <div className="flex items-center justify-center h-[500px] text-sm text-neutral-400">
            Need at least 3 colors for preview
          </div>
        )}
      </div>
    </div>
  )
}
