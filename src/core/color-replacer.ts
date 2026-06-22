import type { ColorMap } from './types'

export function generateTailwindTokens(colorMap: ColorMap): string {
  const entries = Object.entries(colorMap).filter(([, v]) => v)
  const lines: string[] = [':root {']
  for (const [orig, repl] of entries) {
    const key = orig.replace('#', '').toLowerCase()
    lines.push(`  --tw-svg-${key}: ${repl};`)
  }
  lines.push('}', '')
  return lines.join('\n')
}

function downloadBlob(content: string, mime: string, fileName: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function downloadSvg(svgString: string, fileName: string = 'export.svg'): void {
  downloadBlob(svgString, 'image/svg+xml', fileName)
}

export function downloadCssTokens(colorMap: ColorMap, svgName: string = 'colors'): void {
  const css = generateTailwindTokens(colorMap)
  downloadBlob(css, 'text/css', `${svgName}-tokens.css`)
}

const COLOR_ATTRS = ['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color', 'solid-color']

const STYLE_REPLACE_RE = /(fill|stroke|stop-color|flood-color|lighting-color|solid-color)\s*:\s*([^;!]+)/gi

export function applyColorMap(originalSvg: string, colorMap: ColorMap): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(originalSvg, 'image/svg+xml')

  const svgRoot = doc.documentElement

  const reverseMap = new Map<string, string>()
  for (const [orig, repl] of Object.entries(colorMap)) {
    if (orig !== repl) {
      reverseMap.set(orig.toLowerCase(), repl)
    }
  }

  if (reverseMap.size === 0) {
    return originalSvg
  }

  function walk(el: Element) {
    for (const attr of COLOR_ATTRS) {
      const value = el.getAttribute(attr)
      if (value && reverseMap.has(value.toLowerCase())) {
        el.setAttribute(attr, reverseMap.get(value.toLowerCase())!)
      }
    }

    const styleAttr = el.getAttribute('style')
    if (styleAttr) {
      const replaced = styleAttr.replace(STYLE_REPLACE_RE, (_, prop, val) => {
        const trimmed = val.trim().toLowerCase()
        const repl = reverseMap.get(trimmed)
        if (repl) return `${prop}:${repl}`
        // try again with semicolon cleanup
        const cleaned = trimmed.replace(/;.*/, '')
        const repl2 = reverseMap.get(cleaned)
        return repl2 ? `${prop}:${repl2}` : `${prop}:${val}`
      })
      if (replaced !== styleAttr) {
        el.setAttribute('style', replaced)
      }
    }

    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i]
      if (child instanceof Element) walk(child)
    }
  }

  walk(svgRoot)

  const serializer = new XMLSerializer()
  return serializer.serializeToString(svgRoot)
}
