import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'

import { SkillNode, type SkillItem, type SkillNodeState } from '@/components/sections/Skills/SkillNode'
import { fibonacciSphere, rotatePoint } from '@/components/sections/Skills/sphere'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap } from '@/lib/gsap'

const RADIUS = 185
const IDLE_SPEED = 0.0012
const FRICTION = 0.94
const DRAG_SENSITIVITY = 0.006
const MAX_PITCH = 1.15
const RING_TILTS = [0, 55, 110] // deg — evenly-spaced great circles around the yaw axis

interface SkillsGlobeCSSProps {
  items: SkillItem[]
  activeCategory?: string | null
}

export function SkillsGlobeCSS({ items, activeCategory = null }: SkillsGlobeCSSProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])
  const ringRefs = useRef<(HTMLDivElement | null)[]>([])
  const reducedMotion = useReducedMotion()

  const basePoints = useMemo(() => fibonacciSphere(items.length, RADIUS), [items.length])

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
  }, [basePoints])

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
