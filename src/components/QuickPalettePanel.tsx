import { useMemo } from 'react'
import { generateHarmonies, generateMultiSeedHarmonies, type HarmonyPalette } from '@/lib/color-theory'
import { textColor } from './preview/types'

interface QuickPalettePanelProps {
  seedColor: string
  onApply: (colors: string[]) => void
  disabled?: boolean
  paletteColors?: string[]
}

export function QuickPalettePanel({ seedColor, onApply, disabled, paletteColors }: QuickPalettePanelProps) {
  const palettes = useMemo(
    () => paletteColors ? generateMultiSeedHarmonies(paletteColors) : generateHarmonies(seedColor),
    [seedColor, paletteColors],
  )

  return (
    <div className="space-y-3">
      {paletteColors ? (
        <div className="text-xs text-gray-400 space-y-1">
          <p>Harmonies based on your palette:</p>
          <div className="flex gap-1">
            {paletteColors.map((c, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded border border-gray-200"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          Palettes generated from <span className="font-mono font-medium" style={{ color: seedColor, backgroundColor: textColor(seedColor) === '#ffffff' ? '#1f2937' : 'transparent', padding: '0 2px', borderRadius: 2 }}>{seedColor}</span>
          {' '}— click to apply all colors at once
        </p>
      )}
      <div className="space-y-3">
        {palettes.map((palette, i) => (
          <PaletteCard
            key={`${palette.name}-${i}`}
            palette={palette}
            onApply={onApply}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}

function PaletteCard({
  palette,
  onApply,
  disabled,
}: {
  palette: HarmonyPalette
  onApply: (colors: string[]) => void
  disabled?: boolean
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-medium text-gray-800">{palette.name}</h4>
          <p className="text-[10px] text-gray-400">{palette.category}</p>
        </div>
        <button
          onClick={() => onApply(palette.colors)}
          disabled={disabled}
          className="px-3 py-1 text-xs rounded-md text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: palette.colors[0] }}
        >
          Apply 🎲
        </button>
      </div>
      <p className="text-[10px] text-gray-400 mb-2">{palette.description}</p>
      <div className="flex gap-1">
        {palette.colors.map((c, i) => (
          <div
            key={i}
            className="flex-1 h-8 rounded border border-gray-100 first:rounded-l-md last:rounded-r-md"
            style={{ backgroundColor: c }}
            title={`${c}`}
          />
        ))}
      </div>
      <div className="flex gap-1 mt-1">
        {palette.colors.map((c, i) => (
            <span
              key={i}
              className="flex-1 text-[9px] font-mono text-center truncate rounded px-0.5"
              style={{ color: textColor(c), backgroundColor: c }}
            >
            {c}
          </span>
        ))}
      </div>
    </div>
  )
}
