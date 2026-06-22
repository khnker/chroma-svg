function parseLen(v: string | null, ref: number = 100): number {
  if (!v) return 0
  const m = v.match(/^([\d.]+)/)
  if (!m) return 0
  let n = parseFloat(m[1])
  if (v.includes('%')) n = n / 100 * ref
  return n
}

function estimatePathArea(d: string): number {
  const cmds = d.match(/[MmLlHhVvCcQqAaZz][^MmLlHhVvCcQqAaZz]*/g) || []
  let total = 0
  let cx = 0, cy = 0
  let startX = 0, startY = 0
  let firstX = 0, firstY = 0
  const points: [number, number][] = []

  for (const cmd of cmds) {
    const op = cmd[0]
    const args = cmd.slice(1).trim().split(/[\s,]+/).filter(Boolean).map(Number)
    if (args.length === 0) continue

    if (op === 'M' || op === 'm') {
      if (points.length > 2) total += shoelace(points)
      points.length = 0
      if (op === 'M') { cx = args[0]; cy = args[1] }
      else { cx += args[0]; cy += args[1] }
      startX = cx; startY = cy
      firstX = cx; firstY = cy
      points.push([cx, cy])
    } else if (op === 'L' || op === 'l') {
      for (let i = 0; i < args.length; i += 2) {
        if (op === 'L') { cx = args[i]; cy = args[i + 1] }
        else { cx += args[i]; cy += args[i + 1] }
        points.push([cx, cy])
      }
    } else if (op === 'H' || op === 'h') {
      for (const a of args) {
        if (op === 'H') cx = a
        else cx += a
        points.push([cx, cy])
      }
    } else if (op === 'V' || op === 'v') {
      for (const a of args) {
        if (op === 'V') cy = a
        else cy += a
        points.push([cx, cy])
      }
    } else if (op === 'Z' || op === 'z') {
      if (points.length > 2) total += shoelace(points)
      points.length = 0
      cx = firstX; cy = firstY
      points.push([cx, cy])
    } else if (op === 'C' || op === 'c') {
      for (let i = 0; i < args.length; i += 6) {
        if (op === 'C') { cx = args[i + 4]; cy = args[i + 5] }
        else { cx += args[i + 4]; cy += args[i + 5] }
        points.push([cx, cy])
      }
    } else if (op === 'Q' || op === 'q') {
      for (let i = 0; i < args.length; i += 4) {
        if (op === 'Q') { cx = args[i + 2]; cy = args[i + 3] }
        else { cx += args[i + 2]; cy += args[i + 3] }
        points.push([cx, cy])
      }
    }
  }

  if (points.length > 2) total += shoelace(points)
  return Math.abs(total)
}

function shoelace(pts: [number, number][]): number {
  let area = 0
  const n = pts.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += pts[i][0] * pts[j][1]
    area -= pts[j][0] * pts[i][1]
  }
  return area / 2
}

function estimatePolygonArea(pts: string): number {
  const coords = pts.trim().split(/[\s,]+/).filter(Boolean).map(Number)
  const points: [number, number][] = []
  for (let i = 0; i < coords.length; i += 2) {
    points.push([coords[i], coords[i + 1]])
  }
  if (points.length < 3) return 0
  return Math.abs(shoelace(points))
}

export function estimateElementArea(el: Element, viewportSize: number = 100): number {
  const tag = el.tagName.toLowerCase()
  const skip = ['svg', 'g', 'defs', 'clipPath', 'mask', 'pattern', 'symbol', 'use', 'a', 'marker', 'linearGradient', 'radialGradient', 'stop', 'filter', 'feGaussianBlur', 'feOffset', 'feMerge', 'feMergeNode']
  if (skip.includes(tag)) return 0

  switch (tag) {
    case 'rect': {
      const w = parseLen(el.getAttribute('width'), viewportSize)
      const h = parseLen(el.getAttribute('height'), viewportSize)
      if (w === 0 && h === 0) return estimateBBoxArea(el)
      return w * h
    }
    case 'circle': {
      const r = parseLen(el.getAttribute('r'), viewportSize)
      return Math.PI * r * r
    }
    case 'ellipse': {
      const rx = parseLen(el.getAttribute('rx'), viewportSize)
      const ry = parseLen(el.getAttribute('ry'), viewportSize)
      return Math.PI * rx * ry
    }
    case 'path': {
      const d = el.getAttribute('d')
      if (!d) return 0
      return estimatePathArea(d)
    }
    case 'polygon':
    case 'polyline': {
      const pts = el.getAttribute('points')
      if (!pts) return 0
      return estimatePolygonArea(pts)
    }
    case 'line': {
      const x1 = parseLen(el.getAttribute('x1'), viewportSize)
      const y1 = parseLen(el.getAttribute('y1'), viewportSize)
      const x2 = parseLen(el.getAttribute('x2'), viewportSize)
      const y2 = parseLen(el.getAttribute('y2'), viewportSize)
      const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
      const sw = parseLen(el.getAttribute('stroke-width'), 1) || 1
      return len * sw
    }
    default:
      return estimateBBoxArea(el)
  }
}

function estimateBBoxArea(el: Element): number {
  const w = parseLen(el.getAttribute('width'), 100)
  const h = parseLen(el.getAttribute('height'), 100)
  if (w > 0 || h > 0) return w * h
  return 0
}

const COLOR_ATTRS = new Set(['fill', 'stroke'])
const SKIP_TAGS = new Set(['svg', 'g', 'defs', 'clipPath', 'mask', 'pattern', 'symbol', 'use', 'a', 'marker', 'linearGradient', 'radialGradient', 'stop', 'filter'])
const NON_COLORS = new Set(['none', 'inherit', 'initial', 'unset', 'currentColor'])

const STYLE_COLOR_RE_2 = /(fill|stroke)\s*:\s*([^;!]+)/gi

function getColorFromStyle(el: Element, attr: string): string | null {
  const direct = el.getAttribute(attr)
  if (direct && !NON_COLORS.has(direct)) return direct
  const style = el.getAttribute('style')
  if (!style) return null
  STYLE_COLOR_RE_2.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = STYLE_COLOR_RE_2.exec(style)) !== null) {
    if (m[1].toLowerCase() === attr) {
      const val = m[2].trim()
      if (val && !NON_COLORS.has(val.toLowerCase())) return val
    }
  }
  return null
}

export function computeColorAreas(doc: Document): Map<string, number> {
  const areaMap = new Map<string, number>()
  const svgRoot = doc.documentElement
  const viewBox = svgRoot.getAttribute('viewBox')
  const viewportSize = viewBox ? parseFloat(viewBox.split(/\s+/)[2] || '100') : 100

  function walk(el: Element) {
    const tag = el.tagName.toLowerCase()
    if (SKIP_TAGS.has(tag)) {
      for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i]
        if (child instanceof Element) walk(child)
      }
      return
    }

    const hasColor = [...COLOR_ATTRS].some(a => getColorFromStyle(el, a) !== null)
    if (!hasColor) return

    const area = estimateElementArea(el, viewportSize)
    if (area <= 0) return

    for (const attr of COLOR_ATTRS) {
      const val = getColorFromStyle(el, attr)
      if (val) {
        const key = val.trim().toLowerCase()
        areaMap.set(key, (areaMap.get(key) || 0) + area)
      }
    }

    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i]
      if (child instanceof Element) walk(child)
    }
  }

  walk(svgRoot)

  return areaMap
}
