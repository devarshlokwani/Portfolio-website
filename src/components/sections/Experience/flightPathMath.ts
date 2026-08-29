export interface PathPoint {
  x: number
  y: number
}

interface PathSample extends PathPoint {
  length: number
}

export interface FlightPath {
  /** SVG path `d` string through the same points */
  d: string
  totalLength: number
  samples: PathSample[]
  /** cumulative arc length at each input point (same length/order as `points`) */
  pointLengths: number[]
}

function cubicPoint(p0: PathPoint, c1: PathPoint, c2: PathPoint, p1: PathPoint, t: number): PathPoint {
  const mt = 1 - t
  const a = mt * mt * mt
  const b = 3 * mt * mt * t
  const c = 3 * mt * t * t
  const d = t * t * t
  return {
    x: a * p0.x + b * c1.x + c * c2.x + d * p1.x,
    y: a * p0.y + b * c1.y + c * c2.y + d * p1.y,
  }
}

/**
 * Builds a smooth, gently wandering path through `points` (horizontal
 * tangent at every point, via the classic "control point = 1/3 of the way
 * to the neighbor, same y" trick — good enough smoothing without pulling in
 * a curve-fitting library), plus a finely-sampled arc-length table so a
 * plane can be positioned/rotated by scroll progress without touching the
 * DOM (no `getPointAtLength` calls on every scroll tick).
 */
export function buildFlightPath(points: PathPoint[], stepsPerSegment = 32): FlightPath {
  const samples: PathSample[] = [{ x: points[0].x, y: points[0].y, length: 0 }]
  const pointLengths: number[] = [0]
  let d = `M ${points[0].x} ${points[0].y}`
  let cumulative = 0

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const half = (p1.x - p0.x) / 2
    const c1 = { x: p0.x + half, y: p0.y }
    const c2 = { x: p1.x - half, y: p1.y }
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p1.x} ${p1.y}`

    let prev = p0
    for (let s = 1; s <= stepsPerSegment; s++) {
      const t = s / stepsPerSegment
      const pt = cubicPoint(p0, c1, c2, p1, t)
      cumulative += Math.hypot(pt.x - prev.x, pt.y - prev.y)
      samples.push({ x: pt.x, y: pt.y, length: cumulative })
      prev = pt
    }
    pointLengths.push(cumulative)
  }

  return { d, totalLength: cumulative, samples, pointLengths }
}

/** Interpolated position + direction of travel (degrees) at a given arc length along the sampled path. */
export function sampleFlightPath(samples: PathSample[], targetLength: number) {
  const clamped = Math.max(0, Math.min(targetLength, samples[samples.length - 1].length))

  let lo = 0
  let hi = samples.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (samples[mid].length < clamped) lo = mid + 1
    else hi = mid
  }

  const b = samples[lo]
  const a = samples[Math.max(0, lo - 1)]
  const span = b.length - a.length
  const t = span > 0 ? (clamped - a.length) / span : 0

  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    angleDeg: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
  }
}
