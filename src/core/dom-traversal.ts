import type { SvgColorAttr } from './types'

const COLOR_ATTRIBUTES = new Set([
  'fill', 'stroke', 'stop-color', 'flood-color',
  'lighting-color', 'solid-color',
])

const NON_COLOR_VALUES = new Set(['none', 'inherit', 'initial', 'unset', 'currentColor'])

const STYLE_COLOR_RE = new RegExp(
  `(${[...COLOR_ATTRIBUTES].join('|')})\\s*:\\s*([^;!]+)`,
  'gi',
)

export function buildCssSelector(element: Element): string {
  const parts: string[] = []
  let current: Element | null = element
  while (current && current.tagName.toLowerCase() !== 'svg') {
    const tag = current.tagName.toLowerCase()
    const id = current.getAttribute('id')
    if (id) {
      parts.unshift(`#${id}`)
      break
    }
    const cls = current.getAttribute('class')
    if (cls) {
      parts.unshift(`${tag}.${cls.split(/\s+/).join('.')}`)
    } else {
      parts.unshift(tag)
    }
    current = current.parentElement
  }
  return parts.join(' > ') || 'svg'
}

export function extractInlineStyles(element: Element): SvgColorAttr[] {
  const attrs: SvgColorAttr[] = []
  const tag = element.tagName.toLowerCase()
  for (const attr of COLOR_ATTRIBUTES) {
    const value = element.getAttribute(attr)
    if (value && !NON_COLOR_VALUES.has(value)) {
      attrs.push({
        elementTag: tag,
        attribute: attr,
        cssSelector: buildCssSelector(element),
        value: value.trim(),
      })
    }
  }
  const styleAttr = element.getAttribute('style')
  if (styleAttr) {
    STYLE_COLOR_RE.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = STYLE_COLOR_RE.exec(styleAttr)) !== null) {
      const prop = match[1].toLowerCase()
      const value = match[2].trim()
      if (value && !NON_COLOR_VALUES.has(value.toLowerCase())) {
        attrs.push({
          elementTag: tag,
          attribute: prop,
          cssSelector: buildCssSelector(element),
          value,
        })
      }
    }
  }
  return attrs
}

export function traverseTree(root: Element): SvgColorAttr[] {
  const attrs: SvgColorAttr[] = []
  function walk(el: Element) {
    attrs.push(...extractInlineStyles(el))
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i]
      if (child instanceof Element) walk(child)
    }
  }
  walk(root)
  return attrs
}
