import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'

import { SkillNode, type SkillItem, type SkillNodeState } from '@/components/sections/Skills/SkillNode'
import {
  fibonacciSphere,
  rotatePoint,
  slerpOnSphere,
  type Point3D,
} from '@/components/sections/Skills/sphere'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap } from '@/lib/gsap'

const RADIUS = 185
const IDLE_SPEED = 0.0012
const FRICTION = 0.94
const DRAG_SENSITIVITY = 0.006
const MAX_PITCH = 1.15
const RING_TILTS = [0, 55, 110] // deg — evenly-spaced great circles around the yaw axis
const VIEWBOX = RADIUS * 1.1 // half-extent of the SVG's coordinate space, in the same units as projected node positions
const ARC_STEPS = 10 // sample points per connection's great-circle arc

interface Connection {
  a: number
  b: number
  /** Set only when both endpoints share a category — that's what lets a
   *  category filter keep this one flying while others go dark. */
  category: string | null
  cycleTicks: number
  flightTicks: number
  phaseOffset: number
  /** Per-connection brightness multiplier — without this every star peaks
   *  at the same opacity, which reads as mechanical. A few noticeably
   *  brighter ones and a few dimmer ones among mostly-average stars sells
   *  the "random shooting star" feel much better than uniform glow. */
  brightness: number
}

function makeConnection(a: number, b: number, category: string | null): Connection {
  return {
    a,
    b,
    category,
    cycleTicks: 150 + Math.random() * 220, // one flight roughly every 2.5–6.2s at 60fps
    flightTicks: 50 + Math.random() * 30, // each flight lasts roughly 0.8–1.3s
    phaseOffset: Math.random() * 900,
    brightness: 0.5 + Math.random() * Math.random() * 1.3, // squared distribution: mostly modest, occasionally a standout
  }
}

/** A sparse, mostly-same-category-biased set of node pairs to send shooting
 *  stars along — a couple of links per category (so filtering to any one
 *  category reliably has something to show) plus a handful of cross-category
 *  links for the default view's texture. Deliberately kept small: this is
 *  meant to read as occasional, subtle flickers of connection, not a busy
 *  web of constant lines. */
function buildConnections(items: SkillItem[]): Connection[] {
  const byCategory = new Map<string, number[]>()
  items.forEach((item, i) => {
    const list = byCategory.get(item.category)
    if (list) list.push(i)
    else byCategory.set(item.category, [i])
  })

  const seen = new Set<string>()
  const connections: Connection[] = []

  const tryAdd = (a: number, b: number, category: string | null) => {
    if (a === b) return false
    const key = a < b ? `${a}-${b}` : `${b}-${a}`
    if (seen.has(key)) return false
    seen.add(key)
    connections.push(makeConnection(a, b, category))
    return true
  }

  byCategory.forEach((indices, category) => {
    if (indices.length < 2) return
    const linksToMake = Math.min(1, indices.length - 1)
    for (let n = 0; n < linksToMake; n++) {
      let guard = 0
      let added = false
      while (!added && guard < 12) {
        guard++
        const a = indices[Math.floor(Math.random() * indices.length)]
        const b = indices[Math.floor(Math.random() * indices.length)]
        added = tryAdd(a, b, category)
      }
    }
  })

  const extras = Math.min(4, Math.round(items.length * 0.15))
  let guard = 0
  while (connections.length < byCategory.size + extras && guard < extras * 25) {
    guard++
    const a = Math.floor(Math.random() * items.length)
    const b = Math.floor(Math.random() * items.length)
    tryAdd(a, b, items[a]?.category === items[b]?.category ? items[a]?.category : null)
  }

  return connections
}

interface SkillsGlobeCSSProps {
  items: SkillItem[]
  activeCategory?: string | null
}

export function SkillsGlobeCSS({ items, activeCategory = null }: SkillsGlobeCSSProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])
  const ringRefs = useRef<(HTMLDivElement | null)[]>([])
  const starRefs = useRef<(SVGPathElement | null)[]>([])
  const reducedMotion = useReducedMotion()

  const basePoints = useMemo(() => fibonacciSphere(items.length, RADIUS), [items.length])
  const connections = useMemo(() => buildConnections(items), [items])
  const arcSamples = useMemo(
    () =>
      connections.map((conn) => {
        const a = basePoints[conn.a]
        const b = basePoints[conn.b]
        if (!a || !b) return []
        const samples: Point3D[] = []
        for (let s = 0; s <= ARC_STEPS; s++) {
          samples.push(slerpOnSphere(a, b, s / ARC_STEPS, RADIUS))
        }
        return samples
      }),
    [connections, basePoints],
  )

  const nodeStates = useMemo<SkillNodeState[]>(
    () =>
      items.map((item) => {
        if (!activeCategory) return 'default'
        return item.category === activeCategory ? 'active' : 'dimmed'
      }),
    [items, activeCategory],
  )

  const rotation = useRef({ yaw: 0.4, pitch: -0.25 })
  const momentum = useRef({ yaw: 0, pitch: 0 })
  const dragging = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })
  const flowTick = useRef(0)

  const render = useCallback(() => {
    const { yaw, pitch } = rotation.current

    basePoints.forEach((base, i) => {
      const node = nodeRefs.current[i]
      if (!node) return

      const p = rotatePoint(base, yaw, pitch)
      const depth = (p.z + RADIUS) / (2 * RADIUS) // 0 (far) .. 1 (near)
      const scale = 0.55 + depth * 0.65
      const opacity = 0.35 + depth * 0.65

      node.style.transform = `translate(-50%, -50%) translate3d(${p.x}px, ${p.y}px, 0) scale(${scale})`
      node.style.opacity = String(opacity)
      node.style.zIndex = String(Math.round(depth * 1000))
    })

    ringRefs.current.forEach((ring, i) => {
      if (!ring) return
      const tilt = RING_TILTS[i] ?? 0
      ring.style.transform = `rotateX(${pitch * -45}deg) rotateY(${(yaw * 180) / Math.PI}deg) rotateZ(${tilt}deg)`
    })

    if (!reducedMotion) flowTick.current += 1

    connections.forEach((conn, i) => {
      const star = starRefs.current[i]
      if (!star) return

      const categoryOk = !activeCategory || conn.category === activeCategory
      const localPhase = (flowTick.current + conn.phaseOffset) % conn.cycleTicks

      if (!categoryOk || localPhase >= conn.flightTicks) {
        star.style.opacity = '0'
        return
      }

      const samples = arcSamples[i]
      if (!samples?.length) return

      const rotated = samples.map((p) => rotatePoint(p, yaw, pitch))
      star.setAttribute(
        'd',
        `M ${rotated.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`,
      )

      const t = localPhase / conn.flightTicks
      const envelope = Math.sin(t * Math.PI) // smooth fade in, peak, fade out
      const length = star.getTotalLength()
      const dashLen = 16

      star.setAttribute('stroke-dasharray', `${dashLen} ${Math.max(length - dashLen, 1)}`)
      star.setAttribute('stroke-dashoffset', String(-(t * length)))
      star.style.opacity = String(envelope * 0.52 * conn.brightness)
    })
  }, [basePoints, connections, arcSamples, activeCategory, reducedMotion])

  useLayoutEffect(() => {
    render() // paint correct positions before the first tick, avoiding a (0,0) flash

    const tick = () => {
      if (dragging.current) return

      if (reducedMotion) return // fully static until the user drags again

      momentum.current.yaw *= FRICTION
      momentum.current.pitch *= FRICTION
      rotation.current.yaw += momentum.current.yaw + IDLE_SPEED
      rotation.current.pitch = Math.max(
        -MAX_PITCH,
        Math.min(MAX_PITCH, rotation.current.pitch + momentum.current.pitch),
      )
      render()
    }

    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [render, reducedMotion])

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    lastPointer.current = { x: e.clientX, y: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return

    const dx = e.clientX - lastPointer.current.x
    const dy = e.clientY - lastPointer.current.y
    lastPointer.current = { x: e.clientX, y: e.clientY }

    const yawDelta = dx * DRAG_SENSITIVITY
    const pitchDelta = -dy * DRAG_SENSITIVITY

    rotation.current.yaw += yawDelta
    rotation.current.pitch = Math.max(
      -MAX_PITCH,
      Math.min(MAX_PITCH, rotation.current.pitch + pitchDelta),
    )
    momentum.current = { yaw: yawDelta, pitch: pitchDelta }

    render()
  }

  const onPointerUp = () => {
    dragging.current = false
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="relative mx-auto h-[380px] w-[380px] cursor-grab touch-none select-none active:cursor-grabbing md:h-[480px] md:w-[480px]"
      style={{ perspective: '1200px' }}
    >
      {/* Shaded backdrop sphere — pure CSS radial gradient, no image assets — so
          the icon cloud reads as a globe rather than a scattered pile of icons. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: RADIUS * 1.62,
          height: RADIUS * 1.62,
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle at 32% 28%, var(--color-accent-soft), transparent 60%), radial-gradient(circle at 50% 50%, var(--color-surface), var(--color-bg) 72%)',
          border: '1px solid var(--color-border)',
          boxShadow: 'inset 0 0 60px 0 rgba(0,0,0,0.35)',
        }}
      />

      {/* Wireframe great-circle rings, rotated in sync with the sphere's yaw/pitch. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{ transformStyle: 'preserve-3d', width: 0, height: 0 }}
      >
        {RING_TILTS.map((tilt, i) => (
          <div
            key={tilt}
            ref={(el) => {
              ringRefs.current[i] = el
            }}
            className="absolute rounded-full border border-border/70"
            style={{
              width: RADIUS * 1.62,
              height: RADIUS * 1.62,
              left: -(RADIUS * 0.81),
              top: -(RADIUS * 0.81),
              transformStyle: 'preserve-3d',
            }}
          />
        ))}
      </div>

      {/* Occasional shooting-star pulses along great-circle arcs between
          skills — each connection is invisible almost all the time, briefly
          fading in as a small comet travels its arc, then fading out again.
          A category filter keeps only same-category connections firing. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`${-VIEWBOX} ${-VIEWBOX} ${VIEWBOX * 2} ${VIEWBOX * 2}`}
      >
        {connections.map((conn, i) => (
          <path
            key={`${conn.a}-${conn.b}-${i}`}
            ref={(el) => {
              starRefs.current[i] = el
            }}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={0.8}
            strokeLinecap="round"
            opacity={0}
            style={{
              filter: `drop-shadow(0 0 ${(1.8 + conn.brightness * 2.2).toFixed(1)}px var(--color-accent))`,
            }}
          />
        ))}
      </svg>

      {items.map((item, i) => (
        <SkillNode
          key={item.id}
          item={item}
          state={nodeStates[i]}
          ref={(el) => {
            nodeRefs.current[i] = el
          }}
        />
      ))}
    </div>
  )
}
