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

function perpendicularDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2)
  return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len
}

export function rdpSimplify(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points

  let maxDist = 0
  let maxIdx = 0

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
      case 'M': case 'm': {
        while (i + 1 < nums.length) points.push(nextCoord())
        break
      }
      case 'L': case 'l': {
        while (i + 1 < nums.length) points.push(nextCoord())
        break
      }
      case 'H': case 'h': {
        while (i < nums.length) {
          cx = isRel ? cx + nums[i] : nums[i]
          i++
          points.push({ x: cx, y: cy })
        }
        break
      }
      case 'V': case 'v': {
        while (i < nums.length) {
          cy = isRel ? cy + nums[i] : nums[i]
          i++
          points.push({ x: cx, y: cy })
        }
        break
      }
      case 'C': case 'c': {
        while (i + 5 < nums.length) {
          i += 4
          points.push(nextCoord())
        }
        break
      }
      case 'S': case 's': {
        while (i + 3 < nums.length) {
          i += 2
          points.push(nextCoord())
        }
        break
      }
      case 'Q': case 'q': {
        while (i + 3 < nums.length) {
          i += 2
          points.push(nextCoord())
        }
        break
      }
      case 'T': case 't': {
        while (i + 1 < nums.length) points.push(nextCoord())
        break
      }
      case 'A': case 'a': {
        while (i + 6 < nums.length) {
          i += 5
          points.push(nextCoord())
        }
        break
      }
    }
  }

  return points
}

function pointsToPath(points: Point[]): string {
  if (points.length === 0) return ''
  let d = `M ${+points[0].x.toFixed(2)} ${+points[0].y.toFixed(2)}`
  for (let i = 1; i < points.length; i++) {
    d += ` L ${+points[i].x.toFixed(2)} ${+points[i].y.toFixed(2)}`
  }
  return d
}

export function simplifySvg(svgRaw: string, epsilon = 1): string {
  const pathRe = /<path\s+([^>]*?)d\s*=\s*"([^"]*)"([^>]*?)>/g
  return svgRaw.replace(pathRe, (_match, before, d, after) => {
    const pts = extractPathPoints(d)
    if (pts.length < 3) return _match
    const simplified = rdpSimplify(pts, epsilon)
    return `<path ${before}d="${pointsToPath(simplified)}"${after}>`
  })
}

export interface PathPointsResult {
  pathIndex: number
  points: Point[]
}

export function getPathPoints(svgRaw: string): PathPointsResult[] {
  const result: PathPointsResult[] = []
  const pathRe = /<path\s+([^>]*?)d\s*=\s*"([^"]*)"([^>]*?)>/g
  let m: RegExpExecArray | null
  let idx = 0
  while ((m = pathRe.exec(svgRaw)) !== null) {
    result.push({ pathIndex: idx++, points: extractPathPoints(m[2]) })
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
      if (dist < threshold) {
        issues.push({ index: i, point: points[i], nextPoint: points[i + 1], distance: dist, pathIndex })
      }
    }
  }
  return issues
}

export function extractViewBox(svgRaw: string): { width: number; height: number } | null {
  const vbm = svgRaw.match(/viewBox\s*=\s*"([^"]+)"/)
  if (!vbm) {
    const wm = svgRaw.match(/width\s*=\s*"(\d+(?:\.\d+)?)"/)
    const hm = svgRaw.match(/height\s*=\s*"(\d+(?:\.\d+)?)"/)
    if (wm && hm) return { width: parseFloat(wm[1]), height: parseFloat(hm[1]) }
    return null
  }
  const parts = vbm[1].split(/\s+/).map(Number)
  if (parts.length === 4) return { width: parts[2], height: parts[3] }
  return null
}

export function addVertexOverlay(svgRaw: string, allPoints: PathPointsResult[], highlightIssues: VertexIssue[] = []): string {
  const issueSet = new Set(
    highlightIssues.map(i => `${i.pathIndex}:${i.index}`)
  )
  const circles = allPoints.flatMap(({ pathIndex, points }) =>
    points.map((p, idx) => {
      const key = `${pathIndex}:${idx}`
      const isIssue = issueSet.has(key)
      return `<circle cx="${+p.x.toFixed(2)}" cy="${+p.y.toFixed(2)}" r="${isIssue ? 2.5 : 1.5}" fill="${isIssue ? '#EF4444' : '#3B82F6'}" opacity="0.85" />`
    })
  ).join('')
  const labels = highlightIssues.map(i =>
    `<text x="${+i.point.x.toFixed(2)}" y="${+(i.point.y - 4).toFixed(2)}" font-size="3" fill="#EF4444" text-anchor="middle">•</text>`
  ).join('')
  const overlay = `<g id="vertex-overlay">${circles}${labels}</g>`
  return svgRaw.replace('</svg>', `${overlay}</svg>`)
}
