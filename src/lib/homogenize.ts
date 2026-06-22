import { formatHex, parse, converter, type Oklch } from 'culori'
import type { ColorMap } from '@/core/types'

const toOklch = converter('oklch')

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function homogenizeColorMap(colorMap: ColorMap, factor: number): ColorMap {
  if (factor <= 0 || Object.keys(colorMap).length === 0) return colorMap

  const entries = Object.entries(colorMap)
  const colors = entries.map(([, v]) => {
    const p = parse(v)
    return p ? (toOklch(p) as Oklch) : null
  })

  const valid = colors.filter((c): c is Oklch => c !== null)
  if (valid.length === 0) return colorMap

  let sumL = 0, sumC = 0
  for (const c of valid) {
    sumL += c.l
    sumC += c.c
  }
  const n = valid.length
  const avgL = sumL / n
  const avgC = sumC / n

  const result: ColorMap = {}
  let ci = 0
  for (const [key] of entries) {
    const c = colors[ci]
    if (!c) {
      result[key] = entries[ci][1]
    } else {
      const hex = formatHex({
        mode: 'oklch',
        l: lerp(c.l, avgL, factor),
        c: lerp(c.c, avgC, factor),
        h: c.h ?? 0,
      })
      result[key] = hex
    }
    ci++
  }

  return result
}
