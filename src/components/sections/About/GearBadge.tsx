import { useEffect, useRef } from 'react'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap } from '@/lib/gsap'

/** Seconds per turn at rest. */
const TURN_SECONDS = 7

/** How much faster it runs while the card is hovered. */
const HOVER_SPEED = 7

/** How long the change of pace takes, in either direction. */
const RAMP = 0.4

/** Half a breath of the dot, hovered. */
const PULSE_SECONDS = 0.42

/** The dot's resting radius, and how far it swells. */
const DOT_R = 4
const DOT_R_MAX = 5.6

/**
 * A shadow of the same shape in both states, so the two interpolate. Going
 * from `none` to a drop-shadow does not animate: the browser has nothing to
 * tween between, and the glow would snap on.
 */
const DOT_GLOW = {
  off: 'drop-shadow(0 0 0 color-mix(in srgb, var(--color-accent) 0%, transparent))',
  on: 'drop-shadow(0 0 5px color-mix(in srgb, var(--color-accent) 75%, transparent))',
}

interface GearBadgeProps {
  /**
   * Whether the card around it is hovered. The trigger is the whole card,
   * not the badge: at forty-four pixels the badge is a small target for
   * something meant to respond to the card being read.
   */
  active?: boolean
}

/**
 * The nut in the corner of the resume card.
 *
 * A hexagon rather than a toothed gear: at eighteen pixels a gear's teeth
 * collapse into a blur, where a nut's six flats stay crisp. It is the same
 * machinery the rest of the site is built from, read at icon size.
 *
 * It turns on its own, always, independent of pointer and scroll. Hovering
 * does not start it, it winds it up: the speed is eased through `timeScale`
 * on the running tween rather than swapped between two animations, so there
 * is no jump at the moment the pace changes and none when it settles back.
 * That is also why this is GSAP and not a CSS animation, which would
 * restart its cycle when its duration changed.
 */
export function GearBadge({ active = false }: GearBadgeProps) {
  const nutRef = useRef<SVGGElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)
  const spin = useRef<gsap.core.Tween | null>(null)
  const pulse = useRef<gsap.core.Tween | null>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return undefined

    const ctx = gsap.context(() => {
      spin.current = gsap.to(nutRef.current, {
        rotation: 360,
        svgOrigin: '12 12',
        duration: TURN_SECONDS,
        ease: 'none',
        repeat: -1,
      })

      // Held ready rather than created on hover, so the first hover starts
      // at the same beat as every one after it.
      pulse.current = gsap.to(dotRef.current, {
        attr: { r: DOT_R_MAX },
        duration: PULSE_SECONDS,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        paused: true,
      })
    })

    return () => {
      ctx.revert()
      spin.current = null
      pulse.current = null
    }
  }, [reducedMotion])

  // Driven by the card's hover rather than the badge's own, so this runs
  // whenever `active` changes rather than off a pointer event here.
  useEffect(() => {
    if (reducedMotion || !spin.current) return
    gsap.to(spin.current, {
      timeScale: active ? HOVER_SPEED : 1,
      duration: RAMP,
      ease: 'power2.out',
    })

    if (active) {
      pulse.current?.play()
      return
    }

    // Eased back to its resting size instead of cut, so leaving mid-breath
    // does not snap the dot.
    pulse.current?.pause()
    gsap.to(dotRef.current, { attr: { r: DOT_R }, duration: 0.3, ease: 'power2.out' })
  }, [active, reducedMotion])

  return (
    <span
      aria-hidden="true"
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-bg"
    >
      {/* Brighter on hover, not lit: the accent is held back at rest and
          brought to full strength, rather than given a glow that would put a
          light source on a card that has none. */}
      <svg
        viewBox="0 0 24 24"
        style={{ opacity: active ? 1 : 0.7 }}
        className="h-[18px] w-[18px] transition-opacity duration-300 ease-out"
      >
        <g ref={nutRef}>
          {/* Flat top and bottom, points left and right: vertices every 60
              degrees from the horizontal. */}
          <path
            d="M22,12 L17,20.66 L7,20.66 L2,12 L7,3.34 L17,3.34 Z"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </g>
        {/* Outside the rotating group: a circle turning about its own centre
            shows nothing, and pulsing it inside a spinning group would make
            the two motions read as one. */}
        <circle
          ref={dotRef}
          cx="12"
          cy="12"
          r={DOT_R}
          fill={`color-mix(in srgb, var(--color-accent) ${active ? 85 : 45}%, transparent)`}
          style={{
            filter: active ? DOT_GLOW.on : DOT_GLOW.off,
            transition: 'filter 300ms ease-out, fill 300ms ease-out',
          }}
        />
      </svg>
    </span>
  )
}
