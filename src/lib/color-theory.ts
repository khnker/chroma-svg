import { formatHex, parse, converter, type Hsl } from 'culori'

export interface HarmonyPalette {
  name: string
  category: string
  description: string
  colors: string[]
}

const toHsl = converter('hsl')
const toHex = (c: Hsl) => formatHex(c)

function hexToHslObj(hex: string): Hsl {
  const p = parse(hex)
  if (!p) return { mode: 'hsl', h: 0, s: 0, l: 50 }
  const h = toHsl(p)
  return { mode: 'hsl', h: h.h ?? 0, s: h.s ?? 0, l: h.l ?? 50 }
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v))
}

function lc(v: number): number {
  return clamp(v, 15, 85)
}

export function generateHarmonies(seedHex: string): HarmonyPalette[] {
  const base = hexToHslObj(seedHex)
  const h = base.h ?? 0
  const s = base.s ?? 0
  const l = base.l ?? 50

  const palettes: HarmonyPalette[] = [
    {
      name: 'Monochromatic',
      category: 'Pantone Tonal',
      description: 'Single hue, varied lightness — classic corporate gradient',
      colors: [0, 25, 50, 75, 100].map((offset) =>
        toHex({ mode: 'hsl', h, s: clamp(s * (1 - offset / 150)), l: lc(15 + offset * 0.7) })
      ),
    },
    {
      name: 'Complementary',
      category: 'Pantone Contrast',
      description: 'Base + exact opposite — maximum visual tension',
      colors: [
        seedHex,
        toHex({ mode: 'hsl', h: (h + 180) % 360, s: clamp(s + 5), l: lc(55) }),
        toHex({ mode: 'hsl', h, s: clamp(s - 20), l: lc(l + 15) }),
        toHex({ mode: 'hsl', h: (h + 180) % 360, s: clamp(s - 10), l: lc(l + 25) }),
        toHex({ mode: 'hsl', h: (h + 180) % 360, s: clamp(s - 30), l: lc(l + 35) }),
      ],
    },
    {
      name: 'Analogous',
      category: 'Pantone Harmony',
      description: 'Three adjacent hues — smooth, natural flow',
      colors: [-60, -30, 0, 30, 60].map((offset) =>
        toHex({ mode: 'hsl', h: (h + offset + 360) % 360, s: clamp(s + (offset === 0 ? 0 : -10)), l: lc(l + 5) })
      ),
    },
    {
      name: 'Triadic',
      category: 'Pantone Dynamic',
      description: 'Three evenly spaced hues — vibrant, balanced energy',
      colors: [
        seedHex,
        toHex({ mode: 'hsl', h: (h + 120) % 360, s: clamp(s), l: lc(l + 10) }),
        toHex({ mode: 'hsl', h: (h + 240) % 360, s: clamp(s + 5), l: lc(l + 5) }),
        toHex({ mode: 'hsl', h: (h + 120) % 360, s: clamp(s - 20), l: lc(l + 25) }),
        toHex({ mode: 'hsl', h: (h + 240) % 360, s: clamp(s - 15), l: lc(l + 20) }),
      ],
    },
    {
      name: 'Tetradic',
      category: 'Pantone Rich',
      description: 'Two complementary pairs — complex, luxurious palette',
      colors: [
        seedHex,
        toHex({ mode: 'hsl', h: (h + 90) % 360, s: clamp(s + 10), l: lc(l - 5) }),
        toHex({ mode: 'hsl', h: (h + 180) % 360, s: clamp(s), l: lc(l + 10) }),
        toHex({ mode: 'hsl', h: (h + 270) % 360, s: clamp(s + 5), l: lc(l) }),
        toHex({ mode: 'hsl', h: (h + 90) % 360, s: clamp(s - 15), l: lc(l + 20) }),
      ],
    },
    {
      name: 'Split Complementary',
      category: 'Pantone Accent',
      description: 'Base + two adjacent to complement — subtle contrast with depth',
      colors: [
        seedHex,
        toHex({ mode: 'hsl', h: (h + 150 + 360) % 360, s: clamp(s + 5), l: lc(l + 5) }),
        toHex({ mode: 'hsl', h: (h + 210 + 360) % 360, s: clamp(s + 5), l: lc(l + 5) }),
        toHex({ mode: 'hsl', h: (h + 150 + 360) % 360, s: clamp(s - 20), l: lc(l + 25) }),
        toHex({ mode: 'hsl', h: (h + 210 + 360) % 360, s: clamp(s - 15), l: lc(l + 20) }),
      ],
    },
  ]

  return palettes
}

export function generateMultiSeedHarmonies(colors: string[]): HarmonyPalette[] {
  const seen = new Set<string>()
  const merged: HarmonyPalette[] = []

  for (const c of colors) {
    for (const p of generateHarmonies(c)) {
      const key = `${p.name}|${p.colors.join(',')}`
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(p)
      }
    }
  }

  return merged
}
