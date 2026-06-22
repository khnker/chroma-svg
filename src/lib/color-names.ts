import { converter } from 'culori'

const toOklch = converter('oklch')

const COMMON_COLORS: Record<string, string> = {
  '#000000': 'Noir',
  '#ffffff': 'Blanc',
  '#ff0000': 'Rouge',
  '#00ff00': 'Vert',
  '#0000ff': 'Azul',
  '#ffff00': 'Jaune',
  '#ff00ff': 'Magenta',
  '#00ffff': 'Cyan',
  '#c0c0c0': 'Argent',
  '#808080': 'Gris',
  '#800000': 'Marron',
  '#808000': 'Olive',
  '#008000': 'Forêt',
  '#800080': 'Violet',
  '#008080': 'Sarcelle',
  '#000080': 'Marine',
  '#ff6600': 'Orange',
  '#ff69b4': 'Rose',
  '#a52a2a': 'Brun',
  '#f5f5dc': 'Beige',
  '#ffe4c4': 'Biscuit',
  '#dda0dd': 'Prune',
  '#98fb98': 'Pâle',
  '#7fffd4': 'Aqua',
  '#ffd700': 'Or',
  '#c0c0c0': 'Gris',
  '#cd5c5c': 'Indien',
  '#f08080': 'Corail',
  '#e0ffff': 'Ciel',
  '#deb887': 'Bois',
  '#add8e6': 'Ciel',
  '#90ee90': 'Légume',
  '#ffb6c1': 'Coquille',
  '#ffa07a': 'Saumon',
  '#20b2aa': 'Lagon',
  '#87ceeb': 'Azur',
  '#778899': 'Ardoise',
  '#b0c4de': 'Acier',
  '#7b68ee': 'Ardoise',
  '#6b8e23': 'Militaire',
  '#daa520': 'Or',
  '#bdb76b': 'Kaki',
  '#b8860b': 'Foncé',
  '#9932cc': 'Orchidée',
  '#8b008b': 'Pourpre',
  '#556b2f': 'Olive',
  '#8fbc8f': 'Marécage',
  '#4682b4': 'Acier',
  '#d2691e': 'Chocolat',
  '#9acd32': 'Printemps',
  '#00ced1': 'Turquoise',
}

const HUE_NAMES: Record<string, string> = {
  rouge: 'Cramoisi',
  orange: 'Ambre',
  jaune: 'Soleil',
  chartreuse: 'Citron',
  vert: 'Émeraude',
  teal: 'Jade',
  cyan: 'Lagon',
  azur: 'Ciel',
  bleu: 'Saphir',
  indigo: 'Indigo',
  violet: 'Améthyste',
  magenta: 'Fuchsia',
  rose: 'Rose',
}

export function hexToName(hex: string): string {
  const lower = hex.toLowerCase()
  if (COMMON_COLORS[lower]) return COMMON_COLORS[lower]

  try {
    const oklch = toOklch(lower)
    if (!oklch) return hex
    const l = oklch.l
    const c = oklch.c ?? 0
    const h = oklch.h ?? 0

    if (c < 0.02) {
      if (l > 0.9) return 'Blanc'
      if (l < 0.15) return 'Noir'
      return 'Gris'
    }

    let hueName: string
    if (h < 25) hueName = 'rouge'
    else if (h < 50) hueName = 'orange'
    else if (h < 80) hueName = 'jaune'
    else if (h < 130) hueName = 'vert'
    else if (h < 180) hueName = 'teal'
    else if (h < 220) hueName = 'azur'
    else if (h < 260) hueName = 'bleu'
    else if (h < 300) hueName = 'violet'
    else hueName = 'rose'

    const base = HUE_NAMES[hueName] ?? hueName

    if (l < 0.3) return `${base} Foncé`
    if (l > 0.8) return `${base} Clair`
    if (c > 0.2) return `${base} Vif`

    return base
  } catch {
    return hex
  }
}

const SUFFIXES: Record<string, string[]> = {
  rouge: ['Ember', 'Ruby', 'Cherry', 'Scarlet'],
  orange: ['Tangerine', 'Marigold', 'Pumpkin', 'Amber'],
  jaune: ['Canary', 'Lemon', 'Daffodil', 'Honey'],
  vert: ['Fern', 'Moss', 'Pine', 'Clover'],
  teal: ['Lagoon', 'Ocean', 'Coral', 'Reef'],
  azur: ['Sky', 'Mist', 'Cloud', 'Horizon'],
  bleu: ['Cosmos', 'Navy', 'Cobalt', 'Denim'],
  violet: ['Lavender', 'Plum', 'Orchid', 'Lilac'],
  rose: ['Blush', 'Candy', 'Bubblegum', 'Peony'],
  gris: ['Ash', 'Stone', 'Pebble', 'Fog'],
  noir: ['Obsidian', 'Raven', 'Onyx', 'Jet'],
}

const ROLES = ['Primary', 'Secondary', 'Accent', 'Neutral', 'Light', 'Dark', 'Surface', 'Text', 'Background', 'Highlight', 'Muted', 'Bold']

export function generateColorName(hex: string, paletteName: string, colorRole?: string): string {
  const lower = hex.toLowerCase()
  const baseName = hexToName(lower)

  if (paletteName) {
    if (colorRole && ROLES.includes(colorRole)) {
      return `${paletteName} ${colorRole}`
    }

    try {
      const h = toOklch(lower)?.h ?? 0
      let hueCat = 'rouge'
      if (h >= 25 && h < 50) hueCat = 'orange'
      else if (h >= 50 && h < 80) hueCat = 'jaune'
      else if (h >= 80 && h < 130) hueCat = 'vert'
      else if (h >= 130 && h < 180) hueCat = 'teal'
      else if (h >= 180 && h < 220) hueCat = 'azur'
      else if (h >= 220 && h < 260) hueCat = 'bleu'
      else if (h >= 260 && h < 300) hueCat = 'violet'
      else if (h >= 300) hueCat = 'rose'

      const suffixes = SUFFIXES[hueCat] ?? ['Hue', 'Tone', 'Shade']
      const suffix = suffixes[Math.abs(hashCode(lower)) % suffixes.length]

      if (hashCode(lower) % 3 === 0) {
        return `${paletteName} ${baseName}`
      }

      return `${paletteName} ${suffix}`
    } catch {
      return `${paletteName} ${baseName}`
    }
  }

  return baseName
}

function hashCode(s: string): number {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function buildNameMatrix(
  colorMap: Record<string, string>,
  paletteName: string | null
): Array<{ original: string; replacement: string; name: string }> {
  const entries = Object.entries(colorMap).filter(([, v]) => v)
  const paletteColors = entries.map(([, v]) => v)
  let roleIdx = 0

  return entries.map(([orig, repl]) => {
    const role = ROLES[roleIdx % ROLES.length]
    roleIdx++
    const name = paletteName
      ? generateColorName(repl, paletteName, role)
      : hexToName(repl)
    return { original: orig, replacement: repl, name }
  })
}
