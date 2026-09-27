import { useEffect, useId, useRef } from 'react'

import {
  SIGNATURE_GLYPHS,
  SIGNATURE_PEN,
  SIGNATURE_STROKES,
  SIGNATURE_VIEWBOX,
} from '@/components/sections/SignTheWall/signaturePath'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap, ScrollTrigger } from '@/lib/gsap'

/** How long the whole word takes to write itself. */
const DRAW_SECONDS = 2.2

/**
 * When the finished lettering takes over from the pen, as a fraction of the
 * draw.
 *
 * A serif has no one stroke weight, so a single pen cannot both fill its
 * stems and keep its counters open. This one is set to keep the counters,
 * which leaves the thickest stems very slightly seamed while it writes. The
 * true letter shapes cross in over the last moment and settle it, by which
 * point the pen has all but finished and there is nothing left to give away.
 */
const SETTLE_AT = 0.88

/**
 * "signature." writing itself.
 *
 * Set in Instrument Serif Italic, the same accent face as every other line on
 * the site that leans, so the drawn word reads as part of the page rather than
 * a flourish dropped onto it. It is a traced path rather than live text
 * because only a path has a length to advance along.
 *
 * Each stroke is its own element. `stroke-dasharray` restarts at every
 * subpath, so fifteen of them in a single path would all draw at once no
 * matter the offset. Advancing them in turn, by their own lengths, is what
 * makes one continuous hand.
 *
 * What is drawn is a thick line along the *outline* of the lettering, clipped
 * back to that same lettering. So the ink arrives solid and edged exactly like
 * the letter, rather than as a hollow tracing of it.
 *
 * Drawn on entry and wound back whenever it leaves, in either direction, so
 * scrolling away and returning writes it again rather than finding it already
 * finished. Reduced motion skips all of it and shows the word.
 */
export function SignatureDraw({ className = '' }: { className?: string }) {
  const rootRef = useRef<SVGSVGElement>(null)
  const strokeRefs = useRef<(SVGPathElement | null)[]>([])
  const settleRef = useRef<SVGGElement>(null)
  const reducedMotion = useReducedMotion()
  const clipId = useId()

  useEffect(() => {
    const root = rootRef.current
    const settle = settleRef.current
    const strokes = strokeRefs.current.filter(Boolean) as SVGPathElement[]
    if (!root || !settle || strokes.length === 0) return undefined

    const lengths = strokes.map((s) => s.getTotalLength())
    const total = lengths.reduce((a, c) => a + c, 0)

    /** Puts the pen at `p` through the whole word. */
    const place = (p: number) => {
      const reached = p * total
      let start = 0
      strokes.forEach((stroke, i) => {
        const len = lengths[i]
        const local = Math.max(0, Math.min(1, (reached - start) / len))
        stroke.style.strokeDasharray = String(len)
        stroke.style.strokeDashoffset = String(len * (1 - local))
        start += len
      })
    }

    if (reducedMotion) {
      strokes.forEach((s) => {
        s.style.strokeDasharray = 'none'
        s.style.strokeDashoffset = '0'
      })
      settle.style.opacity = '1'
      return undefined
    }

    const ctx = gsap.context(() => {
      const at = { p: 0 }
      place(0)

      const draw = gsap.timeline({ paused: true })
      draw.to(at, {
        p: 1,
        duration: DRAW_SECONDS,
        ease: 'power1.inOut',
        onUpdate: () => place(at.p),
      })
      draw.to(
        settle,
        { opacity: 1, duration: DRAW_SECONDS * (1 - SETTLE_AT), ease: 'none' },
        DRAW_SECONDS * SETTLE_AT,
      )

      ScrollTrigger.create({
        trigger: root,
        start: 'top 85%',
        end: 'bottom 15%',
        onEnter: () => draw.restart(),
        onEnterBack: () => draw.restart(),
        // Wound all the way back rather than paused, so the next arrival
        // starts from a blank line instead of resuming a half-written one.
        // Rewinding the timeline takes the settled lettering with it.
        onLeave: () => {
          draw.pause(0)
          place(0)
        },
        onLeaveBack: () => {
          draw.pause(0)
          place(0)
        },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [reducedMotion])

  const ink = `url(#${clipId}-ink)`

  return (
    <svg
      ref={rootRef}
      viewBox={SIGNATURE_VIEWBOX}
      role="img"
      aria-label="signature"
      className={className}
    >
      <defs>
        {/* The lettering itself, holding the pen inside the letter shapes. */}
        <clipPath id={clipId}>
          {SIGNATURE_GLYPHS.map((s, i) => (
            <path key={i} d={s.d} transform={`translate(${s.x} 0)`} />
          ))}
        </clipPath>
        {/* A tonal shift along the word, so the ink reads as ink rather than
            as a flat fill. The far stop leans on the foreground colour, not
            on white: white lightens the accent, which lifts it off the dark
            page but sinks it into the off-white one, leaving "ure." washed
            out in the light theme. Leaning on the foreground moves away from
            whichever background is behind it. */}
        <linearGradient id={`${clipId}-ink`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-accent)" />
          <stop offset="100%" stopColor="color-mix(in srgb, var(--color-accent) 55%, var(--color-fg))" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {SIGNATURE_STROKES.map((s, i) => (
          <path
            key={i}
            ref={(el) => {
              strokeRefs.current[i] = el
            }}
            d={s.d}
            transform={`translate(${s.x} 0)`}
            fill="none"
            stroke={ink}
            strokeWidth={SIGNATURE_PEN}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </g>

      {/* The settled word, crossing in as the pen finishes. */}
      <g ref={settleRef} opacity={0}>
        {SIGNATURE_GLYPHS.map((s, i) => (
          <path key={i} d={s.d} transform={`translate(${s.x} 0)`} fill={ink} />
        ))}
      </g>
    </svg>
  )
}
