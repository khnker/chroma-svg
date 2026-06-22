const COLOR_ATTRIBUTES = new Set([
  'fill', 'stroke', 'stop-color', 'flood-color',
  'lighting-color', 'solid-color',
])

const NON_COLOR_VALUES = new Set(['none', 'inherit', 'initial', 'unset', 'currentColor'])

export interface CssColorRule {
  selector: string
  property: string
  value: string
}

const CSS_PROP_RE = new RegExp(`(${[...COLOR_ATTRIBUTES].join('|')})\\s*:\\s*([^;!]+)`, 'gi')

function parseStyleText(text: string): { selector: string; property: string; value: string }[] {
  const rules: { selector: string; property: string; value: string }[] = []
  const cleaned = text.replace(/\/\*[\s\S]*?\*\//g, '')
  const blockRe = /([^{]+)\{([^}]+)\}/g
  let match: RegExpExecArray | null
  while ((match = blockRe.exec(cleaned)) !== null) {
    const selector = match[1].trim()
    const body = match[2]
    CSS_PROP_RE.lastIndex = 0
    let propMatch: RegExpExecArray | null
    while ((propMatch = CSS_PROP_RE.exec(body)) !== null) {
      const value = propMatch[2].trim()
      if (value && !NON_COLOR_VALUES.has(value.toLowerCase())) {
        rules.push({ selector, property: propMatch[1].toLowerCase(), value })
      }
    }
  }
  return rules
}

export function extractStyleRules(doc: Document): CssColorRule[] {
  const rules: CssColorRule[] = []

  const styleSheets = doc.styleSheets
  for (const sheet of styleSheets) {
    try {
      const cssRules = (sheet as CSSStyleSheet).cssRules
      for (const rule of cssRules) {
        if (rule instanceof CSSStyleRule) {
          for (const prop of COLOR_ATTRIBUTES) {
            const value = rule.style.getPropertyValue(prop)
            if (value && !NON_COLOR_VALUES.has(value.trim())) {
              rules.push({
                selector: rule.selectorText,
                property: prop,
                value: value.trim(),
              })
            }
          }
        }
      }
    } catch {
      // cross-origin stylesheet, skip
    }
  }

  if (rules.length === 0) {
    const styleEls = doc.querySelectorAll('style')
    for (const el of styleEls) {
      const text = el.textContent
      if (!text) continue
      for (const r of parseStyleText(text)) {
        rules.push(r)
      }
    }
  }

  return rules
}

export function buildColorKey(hex: string): string {
  return hex.toLowerCase()
}
