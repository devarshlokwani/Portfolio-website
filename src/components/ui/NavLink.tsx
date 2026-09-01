import { useEffect, useRef } from 'react'

import { gsap } from '@/lib/gsap'

interface NavLinkProps {
  href: string
  label: string
  filled: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
  /** Nav owns the actual scroll (and suppressing scroll-spy flicker while it
   *  runs) since it also owns activeIndex — this just tells it to go. */
  onNavigate: () => void
}

// A circle anchored at the left-center, growing from a point to comfortably
// past the pill's farthest corner (150% covers any label width) — reads as
// an airbag inflating outward rather than a rectangle sliding across. The
// pill's own rounded shape clips it further once the circle outgrows the
// left cap, so it starts as a small dot, briefly fills just the rounded cap,
// then bulges out to cover the whole label with a curved leading edge.
const HIDDEN_CLIP = 'circle(0% at 0% 50%)'
const REVEALED_CLIP = 'circle(150% at 0% 50%)'

// Once a fill/unfill starts, it commits to that direction for at least this
// long before a reversal is allowed to start. Without this, flicking the
// mouse across the nav quickly kills and restarts the timeline every few
// milliseconds — each restart is individually smooth, but the rapid-fire
// reversals read as jitter. This coalesces that noise into one clean cycle.
const MIN_HOLD_MS = 110

/**
 * Nav link with a left-to-right "airbag" fill: on hover the pill-shaped fill
 * wipes in from the left edge while the default (muted) text is swept out to
 * the right ahead of it, and the inverted (on-fill) text slides in from the
 * left behind the wipe. On hover-out everything retraces the same path in
 * reverse: the fill deflates back toward the left, the inverted text exits
 * leftward with it, and the default text slides back in from the right.
 * `filled` also drives this from scroll-spy, so the active section's link
 * and a separately-hovered link can both be filled at once — each link owns
 * its own animation.
 */
export function NavLink({ href, label, filled, onHoverStart, onHoverEnd, onNavigate }: NavLinkProps) {
  const fillRef = useRef<HTMLSpanElement>(null)
  const fillTextRef = useRef<HTMLSpanElement>(null)
  const defaultTextRef = useRef<HTMLSpanElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const mounted = useRef(false)

  // "Applied" tracks what's currently animating/settled; "desired" tracks the
  // latest value from props, which may race ahead of it while a hold or an
  // in-flight animation is pending.
  const appliedFilled = useRef(filled)
  const desiredFilled = useRef(filled)
  const lastStartedAt = useRef(0)
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const fill = fillRef.current
    const fillText = fillTextRef.current
    const defaultText = defaultTextRef.current
    if (!fill || !fillText || !defaultText) return

    desiredFilled.current = filled

    const play = (isFilled: boolean) => {
      appliedFilled.current = isFilled
      lastStartedAt.current = performance.now()
      timelineRef.current?.kill()
      const tl = gsap.timeline()
      timelineRef.current = tl

      if (isFilled) {
        // The outgoing text needs to clear out fast — any slower and there's
        // a visible gap where neither text is showing, which reads as a
        // stuck blank blob rather than a fill. The incoming text follows
        // almost immediately behind it, well before the fill finishes.
        // Both move rightward, matching the wipe's own left-to-right growth.
        tl.to(fill, { clipPath: REVEALED_CLIP, duration: 0.32, ease: 'power3.out' }, 0)
        tl.to(defaultText, { xPercent: 130, opacity: 0, duration: 0.14, ease: 'power2.in' }, 0)
        tl.to(fillText, { xPercent: 0, opacity: 1, duration: 0.28, ease: 'power3.out' }, 0.03)
      } else {
        // Exit fast (matching how quickly the fill text arrived), then let
        // the original text drop back in noticeably slower — a gradual
        // settle rather than a snap, so the two directions don't feel
        // symmetric. Both move leftward, retracing the fill's own retreat.
        tl.to(fill, { clipPath: HIDDEN_CLIP, duration: 0.3, ease: 'power3.inOut' }, 0)
        tl.to(fillText, { xPercent: -130, opacity: 0, duration: 0.15, ease: 'power2.in' }, 0)
        tl.to(defaultText, { xPercent: 0, opacity: 1, duration: 0.52, ease: 'back.out(1.5)' }, 0.06)
      }
    }

    if (!mounted.current) {
      gsap.set(fill, { clipPath: filled ? REVEALED_CLIP : HIDDEN_CLIP })
      gsap.set(fillText, { xPercent: filled ? 0 : -130, opacity: filled ? 1 : 0 })
      gsap.set(defaultText, { xPercent: filled ? 130 : 0, opacity: filled ? 0 : 1 })
      appliedFilled.current = filled
      lastStartedAt.current = performance.now()
      mounted.current = true
      return
    }

    if (pendingTimeout.current !== null) {
      // A reversal is already queued for whenever the hold expires — it
      // reads desiredFilled at fire time, so nothing to do here except drop
      // the queue entirely if we've flicked right back to the applied state.
      if (filled === appliedFilled.current) {
        clearTimeout(pendingTimeout.current)
        pendingTimeout.current = null
      }
      return
    }

    if (filled === appliedFilled.current) return

    const elapsed = performance.now() - lastStartedAt.current
    if (elapsed >= MIN_HOLD_MS) {
      play(filled)
    } else {
      pendingTimeout.current = setTimeout(() => {
        pendingTimeout.current = null
        if (desiredFilled.current !== appliedFilled.current) {
          play(desiredFilled.current)
        }
      }, MIN_HOLD_MS - elapsed)
    }
  }, [filled])

  useEffect(
    () => () => {
      if (pendingTimeout.current !== null) clearTimeout(pendingTimeout.current)
      timelineRef.current?.kill()
    },
    [],
  )

  // Apple-nav-style click flourish: the visible (on-fill) label rolls up and
  // out, then re-enters from below — deliberately vertical where the hover
  // fill is horizontal, so the two motions read as distinct beats instead of
  // the click just replaying the hover — with a brief flash to the accent
  // orange and back riding along the same roll. Reuses the same timelineRef
  // as the hover fill so the two can't fight over fillText if the mouse
  // leaves mid-roll.
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const fill = fillRef.current
    const fillText = fillTextRef.current
    const defaultText = defaultTextRef.current
    if (fill && fillText && defaultText) {
      timelineRef.current?.kill()
      const tl = gsap.timeline()
      timelineRef.current = tl

      // GSAP's color interpolation can't parse a raw `var(--x)` reference
      // (it needs an actual hex/rgb literal to interpolate channel-by-
      // channel), so these are resolved to real values up front — read
      // fresh on every click so it's always correct for whichever theme is
      // currently active.
      const rootStyles = getComputedStyle(document.documentElement)
      const bgColor = rootStyles.getPropertyValue('--color-bg').trim()
      const accentColor = rootStyles.getPropertyValue('--color-accent').trim()

      // If this link wasn't already filled (hovered) before the click —
      // e.g. keyboard activation, or a fast click that outruns the hover
      // fill's own hold delay — clicking is about to change `filled` from
      // false to true, which the *other* effect below reacts to. Left
      // alone, that would call its own play(true) right after this and
      // kill this timeline before it renders a single frame. Marking
      // appliedFilled/lastStartedAt here, synchronously, makes that
      // effect's `filled === appliedFilled.current` check see no change
      // and skip re-triggering — so this timeline has to pick up the slack
      // and do the pill reveal + default-text fade itself in that case.
      const alreadyFilled = appliedFilled.current
      if (!alreadyFilled) {
        tl.to(fill, { clipPath: REVEALED_CLIP, duration: 0.32, ease: 'power3.out' }, 0)
        tl.to(defaultText, { xPercent: 130, opacity: 0, duration: 0.14, ease: 'power2.in' }, 0)
      }
      appliedFilled.current = true
      lastStartedAt.current = performance.now()

      // xPercent is pinned to 0 at every step (not just the initial set) —
      // if this click's mouse-move-then-click sequence overlapped with the
      // hover fill's own in-flight xPercent slide (killed above, but GSAP
      // freezes a killed tween's properties wherever they were mid-flight,
      // it doesn't snap them back), a single .set() at the very start isn't
      // enough insurance against that leftover value bleeding into a later
      // step. Pinning it throughout guarantees a pure vertical roll no
      // matter what state preceded this timeline.
      tl.set(fillText, { xPercent: 0, color: bgColor })
      tl.to(fillText, { xPercent: 0, yPercent: -130, opacity: 0, color: accentColor, duration: 0.16, ease: 'power2.in' }, 0)
      tl.set(fillText, { xPercent: 0, yPercent: 130 })
      tl.to(
        fillText,
        { xPercent: 0, yPercent: 0, opacity: 1, color: bgColor, duration: 0.32, ease: 'power3.out' },
        '+=0.02',
      )
      // The color tween above leaves its resolved value as an inline style,
      // which (being higher specificity than the text-bg class) would keep
      // overriding it from then on — frozen at whichever theme was active
      // at click time. Clearing it hands color back to the CSS class, which
      // reads var(--color-bg) live and so actually follows a later theme
      // switch, instead of leaving stale near-invisible text if the fill
      // color and this frozen text color end up nearly the same after a
      // switch (e.g. a light-theme click's near-white leftover, still
      // near-white against dark theme's white fill).
      tl.set(fillText, { clearProps: 'color' })
    }

    e.preventDefault()
    onNavigate()
  }

  return (
    <a
      href={href}
      aria-label={label}
      data-cursor-hover
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={onClick}
      className="relative isolate block overflow-hidden rounded-full px-4 py-2 font-mono text-xs uppercase tracking-wide"
    >
      <span aria-hidden="true" className="invisible block">
        {label}
      </span>
      <span
        ref={defaultTextRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-fg-muted"
      >
        {label}
      </span>
      <span
        ref={fillRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full bg-fg"
      >
        <span
          ref={fillTextRef}
          className="absolute inset-0 flex items-center justify-center text-bg"
        >
          {label}
        </span>
      </span>
    </a>
  )
}
