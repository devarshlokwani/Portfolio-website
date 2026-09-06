import { useEffect, useId, useRef } from 'react'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap, ScrollTrigger } from '@/lib/gsap'

const W = 260
const H = 64

/** How long one pass takes. Brisk: it is a cue, not a scene. */
const FLIGHT_SECONDS = 1.15

/**
 * The dot pattern for the route: a short dash under a round cap, which draws
 * as a dot with air after it.
 *
 * The dash has a real length rather than the hairline that would make each
 * mark perfectly circular. Blink drops a near zero length dash wherever the
 * curve turns tightest, so the crests of the wave came out bare while the
 * straights were fine.
 */
const DOTS = '1 8'

/** How far above and below the middle the route swings. */
const CREST = 15

/** How many half turns of the wave fit across the width. */
const TURNS = 3

const START_X = 12
const END_X = W - 14

/**
 * The route the plane takes: a wave, flown left to right.
 *
 * Built rather than written out because the numbers matter to each other:
 * every control point is a fraction of one half turn, so changing the crest
 * or the count keeps the curve smooth instead of needing eight coordinates
 * retuned by hand.
 */
const ROUTE = (() => {
  const span = (END_X - START_X) / TURNS
  const crestY = (i: number) => H / 2 + (i % 2 === 0 ? CREST : -CREST)

  let d = `M${START_X},${crestY(0)}`
  for (let i = 0; i < TURNS; i += 1) {
    const x = START_X + span * i
    // Controls sit at roughly a third and two thirds of each half turn,
    // which leaves the tangent flat at every crest. That flat top is what
    // makes it read as a wave rather than as a zigzag with rounded corners.
    d += ` C${x + span * 0.36},${crestY(i)} ${x + span * 0.64},${crestY(i + 1)} ${x + span},${crestY(i + 1)}`
  }
  return d
})()

/**
 * A small black-and-white plane that flies its route when you scroll past it.
 *
 * The section below this is driven entirely by scroll, which is the one
 * thing a reader arriving at a still drawing cannot tell. Saying so in words
 * helps; showing a plane actually flying a route is better, so scrolling
 * past this launches one: a single quick pass along the curve, drawing its
 * trail behind it, at the moment the reader reaches the sentence that
 * explains what the section below does.
 *
 * The path is walked with `getPointAtLength` rather than GSAP's MotionPath
 * plugin, which the project deliberately does not ship: the same call gives
 * both the position and, sampled a pixel ahead, the heading to point along.
 */
export function ScrollPlane() {
  const rootRef = useRef<SVGSVGElement>(null)
  const routeRef = useRef<SVGPathElement>(null)
  const flownRef = useRef<SVGRectElement>(null)
  const planeRef = useRef<SVGGElement>(null)
  const reducedMotion = useReducedMotion()
  const clipId = useId()

  useEffect(() => {
    const route = routeRef.current
    const flown = flownRef.current
    const plane = planeRef.current
    if (!route || !flown || !plane) return undefined

    const length = route.getTotalLength()

    /** Puts the plane at `t` along the route, nose along the tangent. */
    const place = (t: number) => {
      const at = length * t
      const here = route.getPointAtLength(at)
      // A point just ahead is the heading. At the very end there is nothing
      // ahead, so the sample is taken behind and the direction is the same.
      const ahead = route.getPointAtLength(Math.min(length, at + 1))
      const behind = route.getPointAtLength(Math.max(0, at - 1))
      const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI
      plane.setAttribute('transform', `translate(${here.x} ${here.y}) rotate(${angle})`)
      // How far the plane has flown, as a width. The route only ever runs
      // left to right, so clipping the bright copy of it at the plane's own
      // x leaves the trail lit behind and faint ahead. A dashed line cannot
      // be revealed with `stroke-dashoffset` the way a solid one can, since
      // the dashes are already spending the pattern.
      flown.setAttribute('width', String(Math.max(0, here.x)))
    }

    if (reducedMotion) {
      place(1)
      return undefined
    }

    place(0)

    const ctx = gsap.context(() => {
      const progress = { t: 0 }
      const flight = gsap.timeline({ paused: true })
      flight.fromTo(
        progress,
        { t: 0 },
        {
          t: 1,
          duration: FLIGHT_SECONDS,
          ease: 'power2.inOut',
          onUpdate: () => place(progress.t),
        },
      )

      // Fired by scroll, not scrubbed to it. Tying the plane's position to
      // scroll position meant it crawled or jerked at whatever pace the page
      // happened to be moving, and stopped dead whenever the reader did.
      // Triggering a fixed flight means it always reads the same: one clean
      // pass at the speed it was drawn to fly, whatever the scroll did.
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top 82%',
        // Played and reversed rather than restarted and reset. The trigger
        // fires while the plane is still on screen, so snapping it back to
        // the start was a jump the reader watched happen; flying it back the
        // way it came reads as the same journey undone. `play` and `reverse`
        // also pick up from wherever it currently is, so changing direction
        // mid-flight turns it around instead of jumping.
        onEnter: () => flight.play(),
        onLeaveBack: () => flight.reverse(),
      })
    }, rootRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <svg
      ref={rootRef}
      viewBox={`0 0 ${W} ${H}`}
      className="h-16 w-[260px] overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <rect ref={flownRef} x={0} y={0} width={0} height={H} />
        </clipPath>
      </defs>

      {/* Round dots with air between them rather than a hairline: a route
          marked out the way a flight is drawn on a map, and the shape that
          survives being two pixels wide. Twice over, the same path, one faint
          for the way still to go and one bright clipped to how far the plane
          has actually flown. */}
      <path
        ref={routeRef}
        d={ROUTE}
        fill="none"
        stroke="var(--color-fg)"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeDasharray={DOTS}
        opacity={0.24}
      />
      <g clipPath={`url(#${clipId})`}>
        <path
          d={ROUTE}
          fill="none"
          stroke="var(--color-fg)"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeDasharray={DOTS}
          opacity={0.85}
        />
      </g>

      {/* A folded dart drawn as line art: the silhouette, the keel down the
          middle, and one crease across each wing, every line running back
          from the nose the way the folds in a real one do. Outlined rather
          than filled so it reads as paper, and its body carries the page
          colour so the dotted trail does not show through it. */}
      <g
        ref={planeRef}
        fill="none"
        stroke="var(--color-fg)"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="M16,0 L-12,-10 L-5,0 L-12,10 Z" fill="var(--color-bg)" strokeWidth={1.6} />
        <path d="M16,0 L-5,0" strokeWidth={1.1} opacity={0.9} />
        <path d="M16,0 L-10.2,-5.4" strokeWidth={0.9} opacity={0.55} />
        <path d="M16,0 L-10.2,5.4" strokeWidth={0.9} opacity={0.55} />
      </g>
    </svg>
  )
}
