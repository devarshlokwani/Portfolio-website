import { useEffect, useMemo, useRef } from 'react'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap } from '@/lib/gsap'

const INK = '#b8622f'
const INK_SOFT = '#c98b5c'
/** The paper the scene is drawn on. Nearer landforms are filled with it so
 *  they *occlude* whatever sits behind them — without that, two ridgelines
 *  simply cross each other into an X instead of one standing in front. */
const PAPER = '#f4ecd8'

/** Deterministic RNG — the same track width always draws the same map, so
 *  the landscape doesn't reshuffle itself on every re-render or resize. */
function makeRng(seed: number) {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Horizontal occupancy for one depth band. Everything placed on the ground
 * goes through one of these, so a barn can't land on a church and a paddock
 * can't be dropped across a field — the generator asks for a span and is
 * told whether it's free, rather than trusting spacing arithmetic.
 */
class Lane {
  private spans: [number, number][] = []

  claim(x: number, halfWidth: number, gap = 14) {
    const a = x - halfWidth - gap
    const b = x + halfWidth + gap
    for (const [s, e] of this.spans) {
      if (a < e && b > s) return false
    }
    this.spans.push([a, b])
    return true
  }
}

/* ------------------------------------------------------------------ *
 * Primitives — each draws around its own local origin at ground level
 * (0,0 = where the thing meets the earth), so placing one is just a
 * translate to the spot it should stand on.
 * ------------------------------------------------------------------ */

function Pine({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0,0 L0,-5" />
      <path d="M-7,-4 L0,-15 L7,-4 Z" />
      <path d="M-6,-11 L0,-21 L6,-11 Z" />
      <path d="M-4.5,-17 L0,-27 L4.5,-17 Z" />
    </g>
  )
}

function Broadleaf({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0,0 L0,-9" />
      <path d="M-8,-9 Q-11,-17 -5,-20 Q-2,-25 3,-22 Q10,-22 9,-13 Q9,-8 0,-9 Z" />
    </g>
  )
}

function House({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-13,0 L-13,-14 L13,-14 L13,0 Z" fill={PAPER} />
      <path d="M-17,-14 L0,-26 L17,-14 Z" fill={PAPER} />
      <path d="M-4,0 L-4,-9 L4,-9 L4,0" />
      <path d="M-10,-11 L-10,-6 L-6.5,-6 L-6.5,-11 Z" />
      <path d="M6.5,-11 L6.5,-6 L10,-6 L10,-11 Z" />
    </g>
  )
}

function Church({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-16,0 L-16,-13 L8,-13 L8,0 Z" fill={PAPER} />
      <path d="M-19,-13 L-4,-24 L11,-13 Z" fill={PAPER} />
      <path d="M8,0 L8,-30 L20,-30 L20,0 Z" fill={PAPER} />
      <path d="M8,-30 L14,-40 L20,-30 Z" fill={PAPER} />
      <path d="M14,-40 L14,-45 M11.5,-43 L16.5,-43" />
      <path d="M-8,0 L-8,-8 Q-4,-11 0,-8 L0,0" />
      <path d="M12,-20 L12,-15 L16,-15 L16,-20 Z" />
    </g>
  )
}

function Barn({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-20,0 L-20,-15 L20,-15 L20,0 Z" fill={PAPER} />
      <path d="M-23,-15 L-12,-27 L12,-27 L23,-15 Z" fill={PAPER} />
      <path d="M-7,0 L-7,-11 L7,-11 L7,0 Z" />
      <path d="M0,-11 L0,0" opacity={0.7} />
      <path d="M-16,-11 L-16,-5 L-11,-5 L-11,-11 Z" />
      <path d="M11,-11 L11,-5 L16,-5 L16,-11 Z" />
    </g>
  )
}

/** Round thatched hut — the roof drawn as a fan of straws, not a plain cone. */
function Hut({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-14,0 L-14,-10 L14,-10 L14,0" fill={PAPER} />
      <path d="M-19,-10 Q0,-30 19,-10 Z" fill={PAPER} />
      <g opacity={0.55} strokeWidth={1.1}>
        <path d="M-13,-11 Q-7,-23 -1,-27" />
        <path d="M-6,-11 Q-3,-23 0,-27" />
        <path d="M6,-11 Q3,-23 0,-27" />
        <path d="M13,-11 Q7,-23 1,-27" />
      </g>
      <path d="M-4,0 L-4,-7 Q0,-9 4,-7 L4,0" />
    </g>
  )
}

function Windmill({
  x,
  y,
  s = 1,
  bladeRef,
}: {
  x: number
  y: number
  s?: number
  bladeRef?: (el: SVGGElement | null) => void
}) {
  const blade = 'M0,-4 L-3.5,-7 L-2,-27 L2,-27 L3.5,-7 Z'
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-9,0 L9,0 L5,-48 L-5,-48 Z" fill={PAPER} />
      <path d="M-7.5,-13 L7.5,-13" opacity={0.55} />
      <path d="M-6,-29 L6,-29" opacity={0.55} />
      <path d="M-3,0 L-3,-9 Q0,-12 3,-9 L3,0" />
      <path d="M-6,-48 L0,-57 L6,-48 Z" fill={PAPER} />
      <g transform="translate(0 -52)">
        <g ref={bladeRef} fill={INK_SOFT} strokeWidth={1.2}>
          <path d={blade} />
          <path d={blade} transform="rotate(90)" />
          <path d={blade} transform="rotate(180)" />
          <path d={blade} transform="rotate(270)" />
        </g>
        <circle r={1.8} fill={INK} stroke="none" />
      </g>
    </g>
  )
}

function Grass({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeWidth={1.4}>
      <path d="M-4,0 Q-6,-5 -8,-8" />
      <path d="M0,0 Q0,-6 -1,-11" />
      <path d="M4,0 Q6,-5 8,-8" />
    </g>
  )
}

/** Tilled plot in the near valley: outlined, with furrows running across. */
function Field({
  x,
  y,
  w,
  h,
  skew = 10,
  rows = 6,
}: {
  x: number
  y: number
  w: number
  h: number
  skew?: number
  rows?: number
}) {
  const furrows = Array.from({ length: rows }, (_, i) => {
    const t = (i + 1) / (rows + 1)
    const yy = -h * t
    const off = skew * t
    return `M${-w / 2 + off},${yy} L${w / 2 + off},${yy}`
  })
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M${-w / 2},0 L${w / 2},0 L${w / 2 + skew},${-h} L${-w / 2 + skew},${-h} Z`} fill={PAPER} />
      <g opacity={0.5} strokeWidth={1.1}>
        {furrows.map((f, i) => (
          <path key={i} d={f} />
        ))}
      </g>
    </g>
  )
}

/**
 * Distant farmland on the hills — an irregular quad rather than the near
 * field's tidy parallelogram, because at that range plots read as a
 * patchwork of odd shapes, not as rows you can pick out.
 */
function Patch({
  x,
  y,
  w,
  h,
  lean,
  rows,
}: {
  x: number
  y: number
  w: number
  h: number
  lean: number
  rows: number
}) {
  const furrows = Array.from({ length: rows }, (_, i) => {
    const t = (i + 1) / (rows + 1)
    return `M${lean * t},${-h * t} L${w + lean * t * 0.6},${-h * t - h * 0.08 * t}`
  })
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M0,0 L${w},${-h * 0.1} L${w + lean * 0.6},${-h * 1.1} L${lean},${-h} Z`} fill={PAPER} />
      <g opacity={0.45} strokeWidth={1}>
        {furrows.map((f, i) => (
          <path key={i} d={f} />
        ))}
      </g>
    </g>
  )
}

/** Still water in the middle distance, with a few ripple strokes. */
function Lake({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={
          `M${-w / 2},0 Q${-w / 2.2},${-h} ${-w * 0.1},${-h} ` +
          `Q${w / 2.4},${-h * 0.9} ${w / 2},${-h * 0.1} ` +
          `Q${w / 2.6},${h * 0.75} ${-w * 0.05},${h * 0.8} ` +
          `Q${-w / 2.1},${h * 0.7} ${-w / 2},0 Z`
        }
        fill={PAPER}
      />
      <g opacity={0.55} strokeWidth={1}>
        <path d={`M${-w * 0.26},${-h * 0.2} L${w * 0.1},${-h * 0.2}`} />
        <path d={`M${-w * 0.16},${h * 0.1} L${w * 0.24},${h * 0.1}`} />
        <path d={`M${-w * 0.3},${h * 0.4} L${w * 0.02},${h * 0.4}`} />
      </g>
    </g>
  )
}

function Fence({ x, y, w, s = 1 }: { x: number; y: number; w: number; s?: number }) {
  const posts = Math.max(2, Math.round(w / 20))
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeWidth={1.3}>
      <path d={`M0,-4 L${w},-4`} />
      <path d={`M0,-9 L${w},-9`} />
      {Array.from({ length: posts + 1 }, (_, i) => (
        <path key={i} d={`M${(w / posts) * i},1 L${(w / posts) * i},-12`} />
      ))}
    </g>
  )
}

function Sheep({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeWidth={1.3}>
      <path d="M-7,-5 Q-9,-11 -3,-11 Q0,-14 4,-11 Q9,-11 7,-5 Z" fill={PAPER} />
      <path d="M7,-8 Q11,-9 10,-5 Q9,-3 7,-4" fill={PAPER} />
      <path d="M-4,-5 L-4,0 M2,-5 L2,0 M5,-4 L5,0" />
    </g>
  )
}

function Cow({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeWidth={1.3}>
      <path d="M-9,-6 L-9,-12 L7,-12 L7,-6 Z" fill={PAPER} />
      <path d="M7,-12 L12,-13 L13,-8 L7,-7" fill={PAPER} />
      <path d="M12,-13 L11,-16 M13,-11 L15,-13" />
      <path d="M-7,-6 L-7,0 M-3,-6 L-3,0 M3,-6 L3,0 M6,-6 L6,0" />
      <path d="M-9,-11 Q-13,-10 -12,-6" />
      <path d="M-4,-11 Q-2,-8 0,-11" opacity={0.6} />
    </g>
  )
}

function Bird({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeWidth={1.2}>
      <path d="M-6,0 Q-3,-3.5 0,0 Q3,-3.5 6,0" />
    </g>
  )
}

/* ------------------------------------------------------------------ *
 * Scene generation
 * ------------------------------------------------------------------ */

interface Placement {
  kind: 'pine' | 'broadleaf' | 'house' | 'church' | 'barn' | 'hut' | 'grass' | 'windmill'
  x: number
  y: number
  s: number
}

interface Ridge {
  d: string
  snow: string[]
  folds: string[]
  hatch: string[]
}

interface Hills {
  d: string
  crestAt: (x: number) => number
}

interface SceneParts {
  ridges: { ridge: Ridge; opacity: number; width: number }[]
  forest: Placement[]
  hillFar: Hills
  hillNear: Hills
  patches: { x: number; y: number; w: number; h: number; lean: number; rows: number }[]
  clumps: Placement[]
  lakes: { x: number; y: number; w: number; h: number }[]
  hedges: string[]
  tracks: string[]
  birds: { x: number; y: number; s: number }[]
  village: Placement[]
  fields: { x: number; y: number; w: number; h: number; skew: number; rows: number }[]
  paddocks: { x: number; y: number; w: number; stock: { x: number; s: number; cow: boolean }[] }[]
  grass: Placement[]
  road: { d1: string; d2: string }
  rivers: { d1: string; d2: string }[]
}

/**
 * A ridgeline with the detail that separates a mountain range from a bare
 * zigzag: a jagged snowline under the high summits, fold lines running down
 * the faces to give the peaks volume, and hatching along one flank so each
 * peak reads as having a lit side and a shaded side.
 */
function buildRidge(
  width: number,
  baseY: number,
  peak: number,
  step: number,
  rng: () => number,
  snowline: number,
): Ridge {
  const pts: [number, number][] = [[-60, baseY]]
  let x = -60
  let up = true
  while (x < width + 60) {
    x += step * (0.6 + rng() * 0.75)
    const y = up ? baseY - peak * (0.58 + rng() * 0.42) : baseY - peak * (0.1 + rng() * 0.26)
    pts.push([x, y])
    up = !up
  }
  pts.push([width + 60, baseY])

  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) d += ` L${pts[i][0]},${pts[i][1]}`
  d += ` L${width + 60},${baseY + 60} L-60,${baseY + 60} Z`

  const snow: string[] = []
  const folds: string[] = []
  const hatch: string[] = []

  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i]
    const drop = baseY - py
    if (drop < peak * 0.4) continue

    // snow only on the genuinely high summits
    if (drop > peak * snowline) {
      const w = drop * 0.3
      snow.push(
        `M${px - w},${py + w * 0.9} L${px - w * 0.62},${py + w * 0.34} ` +
          `L${px - w * 0.3},${py + w * 0.66} L${px - w * 0.04},${py + w * 0.18} ` +
          `L${px + w * 0.28},${py + w * 0.6} L${px + w * 0.58},${py + w * 0.3} ` +
          `L${px + w},${py + w * 0.95}`,
      )
    }

    // the two main faces, plus shorter gullies that stop partway down
    folds.push(`M${px},${py} L${px + drop * 0.36},${baseY}`)
    folds.push(`M${px},${py} L${px - drop * 0.32},${baseY}`)
    folds.push(`M${px + drop * 0.08},${py + drop * 0.26} L${px + drop * 0.25},${baseY}`)
    folds.push(`M${px - drop * 0.07},${py + drop * 0.34} L${px - drop * 0.2},${baseY}`)
    folds.push(`M${px + drop * 0.16},${py + drop * 0.5} L${px + drop * 0.3},${baseY}`)

    // shading strokes down the right flank
    for (let k = 1; k <= 4; k++) {
      const t = k / 5.2
      const sx = px + drop * 0.19 * t
      const sy = py + drop * t
      hatch.push(`M${sx},${sy} L${sx + drop * 0.11},${sy + drop * 0.1}`)
    }
  }
  return { d, snow, folds, hatch }
}

/**
 * Soft rolling ground. Being filled with paper it cleanly cuts off whatever
 * stands behind it, and it hands back a crest lookup so farmland and tree
 * clumps can be seated *on* the slope instead of floating over it.
 */
function buildHills(width: number, baseY: number, amp: number, step: number, rng: () => number): Hills {
  const samples: [number, number][] = []
  let d = `M-60,${baseY}`
  for (let x = -60; x < width + 60; x += step) {
    const h = amp * (0.35 + rng() * 0.65)
    d += ` Q${x + step / 2},${baseY - h} ${x + step},${baseY - h * 0.28}`
    samples.push([x + step / 2, baseY - h * 0.78], [x + step, baseY - h * 0.28])
  }
  d += ` L${width + 60},${baseY + 460} L-60,${baseY + 460} Z`

  const crestAt = (x: number) => {
    if (!samples.length) return baseY
    for (let i = 0; i < samples.length - 1; i++) {
      const [ax, ay] = samples[i]
      const [bx, by] = samples[i + 1]
      if (x >= ax && x <= bx) {
        const t = (x - ax) / (bx - ax || 1)
        return ay + (by - ay) * t
      }
    }
    return samples[samples.length - 1][1]
  }

  return { d, crestAt }
}

function buildScene(width: number, height: number): SceneParts {
  const rng = makeRng(20260903)

  // depth bands, back to front
  const backBase = height * 0.2
  const farBase = height * 0.27
  const midBase = height * 0.355
  const forestY = height * 0.4
  const hillFarBase = height * 0.52
  const hillNearBase = height * 0.645
  const villageY = height * 0.775
  const fieldY = height * 0.885
  const roadY = height * 0.95

  // three ranges: the farthest is barely there, and each nearer one is drawn
  // filled so it stands in front rather than tangling with the one behind
  const ridges = [
    { ridge: buildRidge(width, backBase, height * 0.16, 205, rng, 0.66), opacity: 0.1, width: 1.2 },
    { ridge: buildRidge(width, farBase, height * 0.235, 155, rng, 0.7), opacity: 0.17, width: 1.4 },
    { ridge: buildRidge(width, midBase, height * 0.16, 118, rng, 0.78), opacity: 0.25, width: 1.5 },
  ]

  // --- forest belt tucked under the ranges ---
  const forest: Placement[] = []
  for (let x = -20; x < width + 40; x += 100 + rng() * 125) {
    const n = 4 + Math.floor(rng() * 6)
    for (let i = 0; i < n; i++) {
      forest.push({
        kind: 'pine',
        x: x + (i - n / 2) * (10 + rng() * 5),
        y: forestY + (rng() - 0.5) * 12,
        s: 0.7 + rng() * 0.45,
      })
    }
  }

  const hillFar = buildHills(width, hillFarBase, height * 0.075, 240, rng)
  const hillNear = buildHills(width, hillNearBase, height * 0.07, 300, rng)

  // --- the middle distance: patchwork farmland, copses, water and tracks,
  //     which is what keeps this band from reading as blank paper ---
  const patchLane = new Lane()
  const patches: SceneParts['patches'] = []
  for (let x = 20; x < width - 60; x += 105 + rng() * 95) {
    const w = 60 + rng() * 85
    if (!patchLane.claim(x + w / 2, w / 2, 8)) continue
    patches.push({
      x,
      y: hillFar.crestAt(x) + 14 + rng() * 30,
      w,
      h: 20 + rng() * 16,
      lean: (rng() > 0.5 ? 1 : -1) * (10 + rng() * 16),
      rows: 2 + Math.floor(rng() * 3),
    })
  }

  const clumps: Placement[] = []
  for (let x = 70; x < width; x += 175 + rng() * 190) {
    const n = 2 + Math.floor(rng() * 4)
    const base = hillFar.crestAt(x) + 6 + rng() * 16
    for (let i = 0; i < n; i++) {
      clumps.push({
        kind: rng() > 0.72 ? 'broadleaf' : 'pine',
        x: x + (i - n / 2) * 9,
        y: base + (rng() - 0.5) * 6,
        s: 0.4 + rng() * 0.22,
      })
    }
  }

  const lakes: SceneParts['lakes'] = []
  for (let x = 520; x < width; x += 1250 + rng() * 700) {
    lakes.push({
      x,
      y: hillNear.crestAt(x) + 26 + rng() * 18,
      w: 130 + rng() * 90,
      h: 20 + rng() * 12,
    })
  }

  const hedges: string[] = []
  for (let x = -40; x < width; x += 145 + rng() * 150) {
    const y = hillNear.crestAt(x) + 10 + rng() * 34
    const w = 70 + rng() * 120
    const bow = 5 + rng() * 11
    hedges.push(`M${x},${y} Q${x + w / 2},${y - bow} ${x + w},${y}`)
  }

  // faint cart tracks wandering down out of the hills toward the valley
  const tracks: string[] = []
  for (let x = 300; x < width; x += 620 + rng() * 480) {
    const y0 = hillFar.crestAt(x) + 20
    const sway = 40 + rng() * 50
    tracks.push(
      `M${x},${y0} C${x + sway},${y0 + (villageY - y0) * 0.35} ` +
        `${x - sway},${y0 + (villageY - y0) * 0.65} ${x + sway * 0.3},${villageY - 12}`,
    )
  }

  const birds: SceneParts['birds'] = []
  for (let x = 120; x < width; x += 380 + rng() * 420) {
    const by = height * (0.12 + rng() * 0.13)
    const flock = 2 + Math.floor(rng() * 3)
    for (let i = 0; i < flock; i++) {
      birds.push({
        x: x + i * (16 + rng() * 12),
        y: by + (rng() - 0.5) * 22,
        s: 0.7 + rng() * 0.5,
      })
    }
  }

  // --- the valley, laid out through lanes so nothing lands on anything ---
  const buildLane = new Lane()
  const farmLane = new Lane()
  const village: Placement[] = []
  const fields: SceneParts['fields'] = []
  const paddocks: SceneParts['paddocks'] = []

  // villages first — they get priority on the building lane
  for (let x = 260; x < width - 160; x += 700 + rng() * 320) {
    const plan: { kind: Placement['kind']; dx: number; half: number; s: number }[] = [
      { kind: 'barn', dx: -150, half: 24, s: 0.9 },
      { kind: 'house', dx: -72, half: 18, s: 1.05 },
      { kind: 'church', dx: 0, half: 22, s: 1 },
      { kind: 'house', dx: 68, half: 17, s: 0.95 },
      { kind: 'hut', dx: 132, half: 20, s: 0.9 },
      { kind: 'hut', dx: 190, half: 17, s: 0.75 },
    ]
    for (const b of plan) {
      const bx = x + b.dx
      if (bx < 0 || bx > width) continue
      // a shallow, consistent stagger reads as a street line; random
      // vertical scatter reads as buildings sliding down a hill
      const y = villageY + (b.kind === 'barn' || b.kind === 'hut' ? 10 : 0)
      if (buildLane.claim(bx, b.half, 10)) {
        village.push({ kind: b.kind, x: bx, y, s: b.s })
      }
    }
  }

  // windmills stand out on open ground between villages
  for (let x = 150; x < width; x += 340 + rng() * 220) {
    if (buildLane.claim(x, 26, 26)) {
      village.push({ kind: 'windmill', x, y: villageY + 6, s: 0.9 + rng() * 0.3 })
    }
  }

  // shelter trees fill whatever building-lane gaps are left
  for (let x = 60; x < width; x += 100 + rng() * 110) {
    if (buildLane.claim(x, 12, 8)) {
      village.push({
        kind: rng() > 0.5 ? 'broadleaf' : 'pine',
        x,
        y: villageY - 4,
        s: 0.85 + rng() * 0.4,
      })
    }
  }

  // farmland sits in its own band below the village, above the road
  for (let x = 200; x < width - 120; x += 270 + rng() * 180) {
    const w = 150 + rng() * 110
    if (rng() > 0.34) {
      if (!farmLane.claim(x, w / 2 + 14, 18)) continue
      fields.push({
        x,
        y: fieldY + (rng() - 0.5) * 12,
        w,
        h: 42 + rng() * 22,
        skew: (rng() > 0.5 ? 1 : -1) * (12 + rng() * 12),
        rows: 5 + Math.floor(rng() * 3),
      })
    } else {
      const pw = 130 + rng() * 60
      if (!farmLane.claim(x, pw / 2 + 14, 18)) continue
      const cow = rng() > 0.5
      paddocks.push({
        x: x - pw / 2,
        y: fieldY,
        w: pw,
        stock: Array.from({ length: 2 + Math.floor(rng() * 2) }, (_, i) => ({
          x: 26 + i * (34 + rng() * 22),
          s: 0.85 + rng() * 0.25,
          cow,
        })).filter((st) => st.x < pw - 22),
      })
    }
  }

  // --- undergrowth, split between the village verge and the roadside so it
  //     never ends up standing in the middle of a crop ---
  const grass: Placement[] = []
  for (let x = 40; x < width; x += 80 + rng() * 100) {
    const verge = rng() > 0.5
    grass.push({
      kind: 'grass',
      x,
      y: verge ? villageY + 24 + rng() * 16 : roadY + 14 + rng() * 22,
      s: 0.75 + rng() * 0.45,
    })
  }

  // --- the road runs along the very front, below everything ---
  const road = (() => {
    let d1 = `M-60,${roadY}`
    let d2 = `M-60,${roadY + 22}`
    for (let x = -60; x < width + 60; x += 300) {
      const dip = (rng() - 0.5) * 26
      d1 += ` C${x + 100},${roadY + dip} ${x + 200},${roadY - dip} ${x + 300},${roadY + dip * 0.35}`
      d2 += ` C${x + 100},${roadY + 22 + dip} ${x + 200},${roadY + 22 - dip} ${x + 300},${roadY + 22 + dip * 0.35}`
    }
    return { d1, d2 }
  })()

  // --- rivers come down out of the ranges and cross the valley ---
  const rivers: SceneParts['rivers'] = []
  for (let x = 900; x < width; x += 1500 + rng() * 500) {
    const sway = 55 + rng() * 45
    const mk = (o: number) =>
      `M${x + o},${midBase} C${x - sway + o},${height * 0.55} ${x + sway + o},${height * 0.72} ${x - sway * 0.4 + o},${height}`
    rivers.push({ d1: mk(0), d2: mk(46) })
  }

  return {
    ridges,
    forest,
    hillFar,
    hillNear,
    patches,
    clumps,
    lakes,
    hedges,
    tracks,
    birds,
    village,
    fields,
    paddocks,
    grass,
    road,
    rivers,
  }
}

const STROKE = {
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
} as const

function renderPlacement(
  p: Placement,
  i: number,
  mill: (n: number) => (el: SVGGElement | null) => void,
  millIndex: { n: number },
) {
  switch (p.kind) {
    case 'pine':
      return <Pine key={i} x={p.x} y={p.y} s={p.s} />
    case 'broadleaf':
      return <Broadleaf key={i} x={p.x} y={p.y} s={p.s} />
    case 'house':
      return <House key={i} x={p.x} y={p.y} s={p.s} />
    case 'church':
      return <Church key={i} x={p.x} y={p.y} s={p.s} />
    case 'barn':
      return <Barn key={i} x={p.x} y={p.y} s={p.s} />
    case 'hut':
      return <Hut key={i} x={p.x} y={p.y} s={p.s} />
    case 'grass':
      return <Grass key={i} x={p.x} y={p.y} s={p.s} />
    case 'windmill': {
      const n = millIndex.n++
      return <Windmill key={i} x={p.x} y={p.y} s={p.s} bladeRef={mill(n)} />
    }
  }
}

function RidgeLayer({ ridge, opacity, width }: { ridge: Ridge; opacity: number; width: number }) {
  return (
    <g {...STROKE} stroke={INK} strokeWidth={width} opacity={opacity}>
      <path d={ridge.d} fill={PAPER} />
      <g strokeWidth={1} opacity={0.5}>
        {ridge.folds.map((f, i) => (
          <path key={i} d={f} />
        ))}
      </g>
      <g strokeWidth={0.9} opacity={0.4}>
        {ridge.hatch.map((h, i) => (
          <path key={i} d={h} />
        ))}
      </g>
      <g strokeWidth={1.3}>
        {ridge.snow.map((s, i) => (
          <path key={i} d={s} />
        ))}
      </g>
    </g>
  )
}

/**
 * The hand-inked country the flight crosses — one long panorama laid out
 * across the whole track, so it's fixed to the paper rather than to the
 * viewport: the plane flies over it and the camera pans across it,
 * revealing new ground the whole way.
 *
 * Depth is built two ways. Bands set the vertical order — three ranges,
 * forest, two runs of rolling hills, the settled valley, the road — and
 * every landform in front is *filled with the paper color* so it occludes
 * what stands behind it, which is what stops ridgelines from crossing into
 * an X. Horizontally, everything on the ground is placed through `Lane`
 * occupancy rather than by spacing alone, so a barn never lands on a church
 * and a paddock never straddles a field.
 */
export function SceneryBackdrop({ width, height }: { width: number; height: number }) {
  const bladeRefs = useRef<(SVGGElement | null)[]>([])
  const reducedMotion = useReducedMotion()

  const scene = useMemo(() => buildScene(width, height), [width, height])

  useEffect(() => {
    if (reducedMotion) return undefined
    const tweens = bladeRefs.current.map((el, i) => {
      if (!el) return null
      return gsap.to(el, {
        rotation: 360,
        // each mill runs at its own pace — in lockstep they'd read as one
        // mechanism rather than separate mills catching the same wind
        duration: 8 + (i % 5) * 2.2,
        ease: 'none',
        repeat: -1,
        transformOrigin: '50% 50%',
      })
    })
    return () => tweens.forEach((t) => t?.kill())
  }, [reducedMotion, scene])

  const mill = (i: number) => (el: SVGGElement | null) => {
    bladeRefs.current[i] = el
  }
  const millIndex = { n: 0 }

  return (
    <g aria-hidden="true">
      {scene.ridges.map((r, i) => (
        <RidgeLayer key={i} {...r} />
      ))}

      {/* birds up in the open sky */}
      <g {...STROKE} stroke={INK} opacity={0.22}>
        {scene.birds.map((b, i) => (
          <Bird key={i} x={b.x} y={b.y} s={b.s} />
        ))}
      </g>

      {/* forest belt */}
      <g {...STROKE} stroke={INK} strokeWidth={1.6} opacity={0.28}>
        {scene.forest.map((p, i) => renderPlacement(p, i, mill, millIndex))}
      </g>

      {/* upper rolling ground — filled, so it cuts off the forest behind it */}
      <g {...STROKE} stroke={INK} strokeWidth={1.4} opacity={0.2}>
        <path d={scene.hillFar.d} fill={PAPER} />
      </g>

      {/* distant farmland and copses seated on that slope */}
      <g {...STROKE} stroke={INK} strokeWidth={1.2} opacity={0.19}>
        {scene.patches.map((p, i) => (
          <Patch key={`pt-${i}`} {...p} />
        ))}
        <g strokeWidth={1.3}>{scene.clumps.map((p, i) => renderPlacement(p, i, mill, millIndex))}</g>
      </g>

      {/* cart tracks wandering down toward the valley */}
      <g {...STROKE} stroke={INK} strokeWidth={1.1} opacity={0.15}>
        {scene.tracks.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* lower rolling ground */}
      <g {...STROKE} stroke={INK} strokeWidth={1.5} opacity={0.24}>
        <path d={scene.hillNear.d} fill={PAPER} />
      </g>

      <g {...STROKE} stroke={INK} strokeWidth={1.3} opacity={0.2}>
        {scene.lakes.map((l, i) => (
          <Lake key={`l-${i}`} {...l} />
        ))}
        <g strokeWidth={1.2} opacity={0.85}>
          {scene.hedges.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>

      {/* rivers, behind the settled ground they run through */}
      <g {...STROKE} stroke={INK} strokeWidth={1.8} opacity={0.3}>
        {scene.rivers.map((r, i) => (
          <g key={i}>
            <path d={r.d1} />
            <path d={r.d2} />
          </g>
        ))}
      </g>

      {/* the valley */}
      <g {...STROKE} stroke={INK} strokeWidth={2} opacity={0.42}>
        {scene.village.map((p, i) => renderPlacement(p, i, mill, millIndex))}

        {scene.fields.map((f, i) => (
          <Field key={`f-${i}`} {...f} />
        ))}

        {scene.paddocks.map((p, i) => (
          <g key={`p-${i}`}>
            <Fence x={p.x} y={p.y} w={p.w} />
            {p.stock.map((st, j) =>
              st.cow ? (
                <Cow key={j} x={p.x + st.x} y={p.y - 4} s={st.s} />
              ) : (
                <Sheep key={j} x={p.x + st.x} y={p.y - 4} s={st.s} />
              ),
            )}
          </g>
        ))}

        <path d={scene.road.d1} />
        <path d={scene.road.d2} />

        <g strokeWidth={1.5} opacity={0.7}>
          {scene.grass.map((p, i) => renderPlacement(p, i, mill, millIndex))}
        </g>
      </g>
    </g>
  )
}
