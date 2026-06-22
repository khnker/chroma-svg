import type { ColorEntry, ExtractResult } from './types'
import { normalizeColor } from '@/lib/color-utils'
import { traverseTree } from './dom-traversal'
import { extractStyleRules, buildColorKey } from './css-extractor'
import { computeColorAreas } from '@/lib/svg-area'
import { buildContrastMap } from '@/lib/contrast-map'

export function extractColors(doc: Document): ExtractResult {
  const svgRoot = doc.documentElement
  const inlineAttrs = traverseTree(svgRoot)
  const styleRules = extractStyleRules(doc)
  const areaMap = computeColorAreas(doc)

  const totalArea = Math.max(1, Array.from(areaMap.values()).reduce((s, v) => s + v, 0))

  const colorMap = new Map<string, ColorEntry>()

  for (const attr of inlineAttrs) {
    const normalized = normalizeColor(attr.value)
    if (!normalized) continue
    const key = buildColorKey(normalized)
    const raw = attr.value.trim().toLowerCase()
    const area = areaMap.get(raw) || 0
    if (colorMap.has(key)) {
      const entry = colorMap.get(key)!
      entry.selectors.push(attr)
      entry.elementCount++
      entry.areaWeight += area
    } else {
      colorMap.set(key, {
        original: attr.value,
        normalized,
        selectors: [attr],
        label: attr.value,
        elementCount: 1,
        areaWeight: area,
      })
    }
  }

  for (const rule of styleRules) {
    const normalized = normalizeColor(rule.value)
    if (!normalized) continue
    const key = buildColorKey(normalized)
    const raw = rule.value.trim().toLowerCase()
    const area = areaMap.get(raw) || 0
    if (colorMap.has(key)) {
      const entry = colorMap.get(key)!
      entry.selectors.push({
        elementTag: 'style',
        attribute: rule.property,
        cssSelector: rule.selector,
        value: rule.value,
      })
    } else {
      colorMap.set(key, {
        original: rule.value,
        normalized,
        selectors: [{
          elementTag: 'style',
          attribute: rule.property,
          cssSelector: rule.selector,
          value: rule.value,
        }],
        label: rule.value,
        elementCount: 0,
        areaWeight: area,
      })
    }
  }

  const results = Array.from(colorMap.values())
  for (const entry of results) {
    entry.areaWeight = Math.round((entry.areaWeight / totalArea) * 10000) / 100
  }
  const colors = results.sort((a, b) => b.areaWeight - a.areaWeight)
  const contrastMap = buildContrastMap(doc)
  return { colors, contrastMap }
}
