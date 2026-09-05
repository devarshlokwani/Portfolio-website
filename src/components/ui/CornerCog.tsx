import { useEffect, useRef } from 'react'

import { Gear, gearPath } from '@/components/ui/Gear'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap } from '@/lib/gsap'

const R_BORE = 46
const GEAR = gearPath({ teeth: 12, rTip: 100, rRoot: 78, rBore: R_BORE })

/** Overall strength of the decoration. At full accent the cog reads as the
 *  loudest thing on the page and fights the copy for attention, so it's held
 *  well back: present and clearly orange, but furniture. */
const COG_OPACITY = 0.55

type Placement = 'top' | 'left' | 'right' | 'top-right'

/** Half the cog hangs off the edge it's anchored to; the other half is
 *  covered by the card, which is what sets the 50/50 split. */
const ANCHOR: Record<Placement, string> = {
  top: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2',
  left: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
  right: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
  'top-right': 'right-0 top-0 translate-x-1/3 -translate-y-1/3',
}

/** Turns per full pass through the viewport. Deliberately not a whole
 *  number: a 12-tooth gear is rotationally symmetric every 30°, so landing
 *  back on a multiple of a full turn would leave it looking untouched. */
const TURNS = 0.75

/** Neighbouring cogs counter-rotate, which reads as a linked mechanism
 *  rather than unrelated parts all drifting the same way. */
const SPIN: Record<Placement, number> = { top: 1, left: -1, right: 1, 'top-right': 1 }

/**
 * A gear sitting half-hidden behind the corner or edge of a card.
 *
 * It's rendered as a *sibling before* the card rather than a child of it, so
 * the card's own opaque surface does the covering, which is what sells it
 * as sitting behind the card rather than being clipped by it. The card needs
 * a `relative` wrapper around the pair.
 *
 * It turns with the page rather than under its own power: rotation is
 * scrubbed off scroll position, so the gear only moves while the reader
 * does, and holds still the moment they stop.
 *
 * Hidden below `md`, where cards go full-width and a cog hanging off the
 * side has nowhere to go.
 */
export function CornerCog({
  placement,
  className = 'h-40 w-40 lg:h-48 lg:w-48',
}: {
  placement: Placement
  /** size utilities: the footer's cog is smaller than the About cards' */
  className?: string
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const bodyRef = useRef<SVGGElement>(null)
  const faceRef = useRef<SVGGElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return undefined
    const svg = svgRef.current
    const parts = [bodyRef.current, faceRef.current].filter(Boolean)
    if (!svg || !parts.length) return undefined

    const ctx = gsap.context(() => {
      gsap.to(parts, {
        rotation: 360 * TURNS * SPIN[placement],
        // the gear sits at the origin of its own viewBox, so spin about that
        // rather than the SVG element's CSS box
        svgOrigin: '0 0',
        ease: 'none',
        scrollTrigger: { trigger: svg, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    })
    return () => ctx.revert()
  }, [placement, reducedMotion])

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      viewBox="-112 -112 224 232"
      className={`pointer-events-none absolute hidden md:block ${className} ${ANCHOR[placement]}`}
      style={{ opacity: COG_OPACITY }}
    >
      <Gear d={GEAR} rBore={R_BORE} bodyRef={bodyRef} faceRef={faceRef} />
    </svg>
  )
}
