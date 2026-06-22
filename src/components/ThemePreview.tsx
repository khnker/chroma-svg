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
    <div className="border rounded-xl bg-white shadow-sm h-[600px] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b flex items-center justify-between px-4 py-2">
        <span className="text-sm text-neutral-500 font-mono">{svgName}-tokens.css</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(css)}
            className="px-3 py-1 text-xs border rounded hover:bg-neutral-50"
          >
            Copy CSS
          </button>
          <button
            onClick={() => downloadCssTokens(colorMap, svgName)}
            className="px-3 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600"
          >
            Download CSS
          </button>
        </div>
      </div>
      <div className="p-4">
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
