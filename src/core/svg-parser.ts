import type { ParseResult } from './types'

export function parseSvgString(raw: string): ParseResult {
  const parser = new DOMParser()
  const doc = parser.parseFromString(raw, 'image/svg+xml')
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    return {
      success: false,
      document: null,
      error: parseError.textContent ?? 'Invalid SVG',
    }
  }
  return { success: true, document: doc, error: null }
}

export function serializeSvg(doc: Document): string {
  const serializer = new XMLSerializer()
  return serializer.serializeToString(doc.documentElement)
}
