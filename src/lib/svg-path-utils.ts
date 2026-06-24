export interface Point {
  x: number
  y: number
}

export interface VertexIssue {
  index: number
  point: Point
  nextPoint: Point
  distance: number
  pathIndex: number
}

export interface PathPointsResult {
  pathIndex: number
  points: Point[]
}

function perpendicularDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2)
  return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len
}

export function rdpSimplify(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points
  let maxDist = 0, maxIdx = 0
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], points[0], points[points.length - 1])
    if (d > maxDist) { maxDist = d; maxIdx = i }
  }
  if (maxDist > epsilon) {
    const left = rdpSimplify(points.slice(0, maxIdx + 1), epsilon)
    const right = rdpSimplify(points.slice(maxIdx), epsilon)
    return [...left.slice(0, -1), ...right]
  }
  return [points[0], points[points.length - 1]]
}

// ── SVG attribute helpers (handles both " and ' quotes) ──

function getAttr(attrBlock: string, name: string): string | null {
  const re = new RegExp(`${name}\\s*=\\s*"([^"]*)"|${name}\\s*=\\s*'([^']*)'`)
  const m = attrBlock.match(re)
  return m ? (m[1] ?? m[2] ?? null) : null
}

function setAttr(attrBlock: string, name: string, value: string): string {
  const re = new RegExp(`(${name}\\s*=\\s*["'])[^"']*(["'])`)
  return attrBlock.replace(re, `$1${value}$2`)
}

// ── Path parsing ──

export function extractPathPoints(d: string): Point[] {
  const points: Point[] = []
  let cx = 0, cy = 0
  const cmdRe = /[MLHVCSQTAZmlhvcsqtaz][^MLHVCSQTAZmlhvcsqtaz]*/g
  const numRe = /-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g

  let cmdMatch: RegExpExecArray | null
  while ((cmdMatch = cmdRe.exec(d)) !== null) {
    const cmd = cmdMatch[0]
    const command = cmd[0]
    const nums = [...cmd.slice(1).matchAll(numRe)].map(m => parseFloat(m[0]))
    const isRel = command === command.toLowerCase()
    let i = 0

    const nextCoord = () => {
      cx = isRel ? cx + nums[i] : nums[i]
      cy = isRel ? cy + nums[i + 1] : nums[i + 1]
      i += 2
      return { x: cx, y: cy }
    }

    switch (command) {
      case 'M': case 'm': { while (i + 1 < nums.length) points.push(nextCoord()); break }
      case 'L': case 'l': { while (i + 1 < nums.length) points.push(nextCoord()); break }
      case 'H': case 'h': { while (i < nums.length) { cx = isRel ? cx + nums[i] : nums[i]; i++; points.push({ x: cx, y: cy }) }; break }
      case 'V': case 'v': { while (i < nums.length) { cy = isRel ? cy + nums[i] : nums[i]; i++; points.push({ x: cx, y: cy }) }; break }
      case 'C': case 'c': { while (i + 5 < nums.length) { i += 4; points.push(nextCoord()) }; break }
      case 'S': case 's': { while (i + 3 < nums.length) { i += 2; points.push(nextCoord()) }; break }
      case 'Q': case 'q': { while (i + 3 < nums.length) { i += 2; points.push(nextCoord()) }; break }
      case 'T': case 't': { while (i + 1 < nums.length) points.push(nextCoord()); break }
      case 'A': case 'a': { while (i + 6 < nums.length) { i += 5; points.push(nextCoord()) }; break }
    }
  }
  return points
}

function pointsToPath(points: Point[]): string {
  if (points.length === 0) return ''
  let d = `M ${+points[0].x.toFixed(2)} ${+points[0].y.toFixed(2)}`
  for (let i = 1; i < points.length; i++) d += ` L ${+points[i].x.toFixed(2)} ${+points[i].y.toFixed(2)}`
  return d
}

function hasCurveCommands(d: string): boolean {
  return /[CSQTAcsqta]/.test(d)
}

function pointsAttrToPoints(attr: string): Point[] {
  const numRe = /-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g
  const nums = [...attr.matchAll(numRe)].map(m => parseFloat(m[0]))
  const pts: Point[] = []
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push({ x: nums[i], y: nums[i + 1] })
  return pts
}

function pointsToAttr(points: Point[]): string {
  return points.map(p => `${+p.x.toFixed(2)},${+p.y.toFixed(2)}`).join(' ')
}

// ── Public API ──

export function simplifySvg(svgRaw: string, epsilon = 1.5): string {
  let result = svgRaw

  // <path> — only polyline-like (no curves)
  const pathRe = /<path\s+([^>]*?)>/gi
  result = result.replace(pathRe, (full, attrBlock) => {
    const d = getAttr(attrBlock, 'd')
    if (!d || hasCurveCommands(d)) return full
    const pts = extractPathPoints(d)
    if (pts.length < 3) return full
    const simplified = rdpSimplify(pts, epsilon)
    if (simplified.length === pts.length) return full
    const newAttr = setAttr(attrBlock, 'd', pointsToPath(simplified))
    return `<path ${newAttr}>`
  })

  // <polygon> and <polyline>
  const polyRe = /<(polygon|polyline)\s+([^>]*?)>/gi
  result = result.replace(polyRe, (full, _tag, attrBlock) => {
    const ptsStr = getAttr(attrBlock, 'points')
    if (!ptsStr) return full
    const pts = pointsAttrToPoints(ptsStr)
    if (pts.length < 3) return full
    const simplified = rdpSimplify(pts, epsilon)
    if (simplified.length === pts.length) return full
    const newAttr = setAttr(attrBlock, 'points', pointsToAttr(simplified))
    return `<${_tag} ${newAttr}>`
  })

  return result
}

/** Simplify a single path's d attribute string (for Patch button) */
export function simplifyPathD(d: string, epsilon = 1.5): string | null {
  if (hasCurveCommands(d)) return null
  const pts = extractPathPoints(d)
  if (pts.length < 3) return null
  const simplified = rdpSimplify(pts, epsilon)
  if (simplified.length === pts.length) return null
  return pointsToPath(simplified)
}

export function getPathPoints(svgRaw: string): PathPointsResult[] {
  const result: PathPointsResult[] = []
  const pathRe = /<path\s+([^>]*?)>/gi
  let m: RegExpExecArray | null
  let idx = 0
  while ((m = pathRe.exec(svgRaw)) !== null) {
    const d = getAttr(m[1], 'd')
    if (!d) continue
    result.push({ pathIndex: idx++, points: extractPathPoints(d) })
  }
  const polyRe = /<(polygon|polyline)\s+([^>]*?)>/gi
  while ((m = polyRe.exec(svgRaw)) !== null) {
    const ptsStr = getAttr(m[2], 'points')
    if (!ptsStr) continue
    result.push({ pathIndex: idx++, points: pointsAttrToPoints(ptsStr) })
  }
  return result
}

export function findCloseVertices(svgRaw: string, threshold = 2): VertexIssue[] {
  const issues: VertexIssue[] = []
  for (const { pathIndex, points } of getPathPoints(svgRaw)) {
    for (let i = 0; i < points.length - 1; i++) {
      const dx = points[i + 1].x - points[i].x
      const dy = points[i + 1].y - points[i].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < threshold) issues.push({ index: i, point: points[i], nextPoint: points[i + 1], distance: dist, pathIndex })
    }
  }
  return issues
}

/** Patch close vertices: run simplify on each affected path */
export function patchCloseVertices(svgRaw: string, issues: VertexIssue[], epsilon = 1.5): string {
  const affected = new Set(issues.map(i => i.pathIndex))
  let result = svgRaw
  const pathRe = /<path\s+([^>]*?)>/gi
  let pathIdx = 0
  result = result.replace(pathRe, (full, attrBlock) => {
    const cur = pathIdx++
    if (!affected.has(cur)) return full
    const d = getAttr(attrBlock, 'd')
    if (!d || hasCurveCommands(d)) return full
    const newD = simplifyPathD(d, epsilon)
    if (!newD) return full
    const newAttr = setAttr(attrBlock, 'd', newD)
    return `<path ${newAttr}>`
  })
  return result
}

export function extractViewBox(svgRaw: string): { width: number; height: number } | null {
  const m = svgRaw.match(/viewBox\s*=\s*"([^"]+)"|viewBox\s*=\s*'([^']+)'/)
  if (m) {
    const vb = m[1] ?? m[2]
    if (vb) {
      const parts = vb.split(/\s+/).map(Number)
      if (parts.length === 4) return { width: parts[2], height: parts[3] }
    }
  }
  const wm = svgRaw.match(/width\s*=\s*"(\d+(?:\.\d+)?)"|width\s*=\s*'(\d+(?:\.\d+)?)'/)
  const hm = svgRaw.match(/height\s*=\s*"(\d+(?:\.\d+)?)"|height\s*=\s*'(\d+(?:\.\d+)?)'/)
  if (wm && hm) return { width: parseFloat(wm[1] ?? wm[2]), height: parseFloat(hm[1] ?? hm[2]) }
  return null
}

export function addVertexOverlay(svgRaw: string, allPoints: PathPointsResult[], highlightIssues: VertexIssue[] = []): string {
  if (allPoints.length === 0) return svgRaw
  const issueSet = new Set(highlightIssues.map(i => `${i.pathIndex}:${i.index}`))
  const circles = allPoints.flatMap(({ pathIndex, points }) =>
    points.map((p, idx) => {
      const isIssue = issueSet.has(`${pathIndex}:${idx}`)
      return `<circle cx="${+p.x.toFixed(2)}" cy="${+p.y.toFixed(2)}" r="${isIssue ? 3 : 2}" fill="${isIssue ? '#EF4444' : '#3B82F6'}" opacity="0.9" stroke="#fff" stroke-width="0.5" />`
    })
  ).join('')
  const overlay = `<g id="vertex-overlay">${circles}</g>`
  const closeTag = svgRaw.lastIndexOf('</svg>')
  if (closeTag !== -1) {
    return svgRaw.slice(0, closeTag) + overlay + svgRaw.slice(closeTag)
  }
  return svgRaw + overlay
}

/** Analyze SVG element composition */
export function analyzeSvg(svgRaw: string): { pathCount: number; polyCount: number; shapeCount: number; hasCurves: boolean } {
  const pathRe = /<path\s+/gi
  const polyRe = /<(polygon|polyline)\s+/gi
  const shapeRe = /<(rect|circle|ellipse|line)\s+/gi
  const pathCount = [...svgRaw.matchAll(pathRe)].length
  const polyCount = [...svgRaw.matchAll(polyRe)].length
  const shapeCount = [...svgRaw.matchAll(shapeRe)].length
  const hasCurves = /[CSQTAcsqta]/.test(svgRaw)
  return { pathCount, polyCount, shapeCount, hasCurves }
}
