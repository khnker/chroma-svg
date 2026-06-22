import { useMemo } from 'react'
import { formatHex, converter, type Hsl } from 'culori'
import type { ColorEntry } from '@/core/types'

const toHsl = converter('hsl')
const toHex = (c: Hsl) => formatHex(c)

const COLOR_TERMS = ['dominant', 'secondary', 'accent']

interface TriChromeViewProps {
  colors: ColorEntry[]
  onApply: (colors: string[]) => void
}

function makePalette(base: Hsl, offsets: { h: number; s: number; l: number }[]): string[] {
  return offsets.map((o) =>
    toHex({
      mode: 'hsl',
      h: ((base.h ?? 0) + o.h + 360) % 360,
      s: Math.max(0, Math.min(100, (base.s ?? 50) + o.s)),
      l: Math.max(5, Math.min(95, (base.l ?? 50) + o.l)),
    }),
  )
}

const PALETTE_DEFS: { name: string; offsets: { h: number; s: number; l: number }[] }[] = [
  { name: 'Triadic', offsets: [{ h: 0, s: 0, l: 0 }, { h: 120, s: -5, l: 5 }, { h: 240, s: -5, l: 5 }] },
  { name: 'Analogous', offsets: [{ h: 0, s: 0, l: 0 }, { h: -30, s: -10, l: 5 }, { h: 30, s: -10, l: 5 }] },
  { name: 'Complementary', offsets: [{ h: 0, s: 0, l: 0 }, { h: 180, s: 5, l: 5 }, { h: 0, s: -15, l: 15 }] },
  { name: 'Split Comp', offsets: [{ h: 0, s: 0, l: 0 }, { h: 150, s: 5, l: 5 }, { h: 210, s: 5, l: 5 }] },
  { name: 'Neutral', offsets: [{ h: 0, s: 0, l: 0 }, { h: 0, s: -40, l: 15 }, { h: 0, s: -50, l: -20 }] },
  { name: 'Vibrant', offsets: [{ h: 0, s: 20, l: -5 }, { h: 60, s: 15, l: 0 }, { h: 300, s: 15, l: 0 }] },
]

export function TriChromeView({ colors, onApply }: TriChromeViewProps) {
  const palettes = useMemo(() => {
    if (colors.length === 0) return []

    const sorted = [...colors].sort((a, b) => b.areaWeight - a.areaWeight)
    const dominant = sorted.slice(0, 3)
    if (dominant.length === 0) return []

    const seed = dominant[0].normalized
    const parsed = toHsl(seed)
    if (!parsed || parsed.h === undefined) return []

    return PALETTE_DEFS.map((def) => ({
      name: def.name,
      colors: makePalette(parsed, def.offsets),
    }))
  }, [colors])

  if (palettes.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm">
        Load an SVG to see tri-chrome palettes
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">
        3-color palettes generated from your dominant colors
      </p>
      <div className="space-y-3">
        {palettes.map((palette) => (
          <div key={palette.name} className="rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-800">{palette.name}</h4>
              <button
                onClick={() => onApply(palette.colors)}
                className="px-3 py-1 text-xs rounded-md text-white font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: palette.colors[0] }}
              >
                Apply 🎲
              </button>
            </div>
            <div className="flex gap-1">
              {palette.colors.map((c, i) => (
                <div key={c} className="flex-1 space-y-1">
                  <div
                    className="w-full aspect-[2/1] rounded border border-gray-100"
                    style={{ backgroundColor: c }}
                  />
                  <p className="text-[9px] font-mono text-center text-gray-500 truncate">
                    {COLOR_TERMS[i] ?? ''}
                  </p>
                  <p className="text-[9px] font-mono text-center text-gray-400 truncate">{c}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}