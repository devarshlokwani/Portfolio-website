import { useRef } from 'react'
import type { IconType } from 'react-icons'
import { LuFileText } from 'react-icons/lu'

import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface CtaLaunchLinkProps {
  href: string
  label: string
  className: string
  icon?: IconType
  /** target="_blank" + window.open, for links that leave the page open (e.g. a project's live site) */
  external?: boolean
  /** for non-external links: called instead of the default anchor navigation, once the launch beat fires */
  onNavigate?: () => void
}

// A symmetric converging fan — longest line through the center, shorter
// ones above and below — straight/horizontal lines, each just at a
// different height, growing out from the icon toward the left. Each has
// its own small burst delay so they don't all snap in as one flat sweep,
// with the center line (closest to the icon's own path) leading.
const LINES = [
  { y: -7, length: 22, thickness: 2, delay: 0.015, opacity: 0.75 },
  { y: 0, length: 30, thickness: 2.2, delay: 0, opacity: 0.9 },
  { y: 7, length: 22, thickness: 2, delay: 0.015, opacity: 0.75 },
]

/**
 * An accent CTA with a launch flourish on click, styled after anime/manga
 * speed lines — the visual shorthand for "this just took off fast": the
 * label rolls up and out (the same vertical exit as the nav's own click
 * roll), an icon enters small, pops up to a slight overshoot, and shifts
 * right — and as it moves, a handful of irregular lines trailing off its
 * edge grow out from short stubs into full length (not a uniform row
 * snapping in at once — real speed lines peel off at different points,
 * angles and speeds, the way a dragged/blurred edge would). The icon then
 * minimizes and launches off along with the lines as the real navigation
 * fires a beat later, and the label rolls back in afterward so the button
 * is ready to use again. That reset matters because neither use case
 * unmounts the button: an in-page scroll leaves it sitting in the hero, and
 * an external project link opens in a new tab while this page doesn't move.
 */
export function CtaLaunchLink({
  href,
  label,
  className,
  icon: Icon = LuFileText,
  external = false,
  onNavigate,
}: CtaLaunchLinkProps) {
  const labelRef = useRef<HTMLSpanElement>(null)
  const burstRef = useRef<HTMLSpanElement>(null)
  const groupRef = useRef<HTMLSpanElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([])
  const playingRef = useRef(false)
  const reducedMotion = useReducedMotion()

  const fire = () => {
    if (external) {
      // Chrome (and other engines) keep a several-second "transient
      // activation" window open after a real click, so window.open still
      // counts as user-initiated this ~0.7s into the timeline — it isn't
      // limited to strictly synchronous calls. Firing it here (rather than
      // immediately on click) matters for real UX, not just sequencing:
      // opening a tab immediately steals focus, which backgrounds this
      // page and freezes the rest of the flourish mid-animation (Chromium
      // throttles rAF in background tabs) — so the whole point of building
      // it would go mostly unseen. Firing after the animation completes
      // means it always plays out first.
      window.open(href, '_blank', 'noopener,noreferrer')
    } else {
      onNavigate?.()
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (playingRef.current) return

    const labelEl = labelRef.current
    const burst = burstRef.current
    const group = groupRef.current
    const iconEl = iconRef.current
    const lineEls = lineRefs.current

    if (reducedMotion || !labelEl || !burst || !group || !iconEl || lineEls.some((el) => !el)) {
      fire()
      return
    }

    playingRef.current = true

    const tl = gsap.timeline({
      onComplete: () => {
        playingRef.current = false
      },
    })

    // text exits, same roll-up-and-out as the nav's click flourish
    tl.to(labelEl, { yPercent: -130, opacity: 0, duration: 0.16, ease: 'power2.in' }, 0)

    // the icon's true starting state has to be set explicitly before burst
    // opacity turns on — otherwise it sits at its untouched default (full
    // size, fully opaque) for the gap between burst becoming visible and
    // the icon's own tween starting, which flashes it big for a frame
    // before snapping small. Setting it here removes that gap entirely.
    tl.set(iconEl, { scale: 0.3, opacity: 0 }, 0)
    tl.set(burst, { opacity: 1 }, 0.08)

    // a clean, modest entrance — small up to normal size, nothing bigger
    // yet. The growth that actually needs to read has to happen *during*
    // the rightward move (below), fully opaque — growing it here first
    // would make it look biggest while still sitting on the left.
    tl.to(iconEl, { scale: 1, opacity: 1, duration: 0.22, ease: 'power2.out' }, 0.1)

    // shifts right — the "taking off" beat — enlarging the whole way while
    // staying fully opaque, so the growth is what's actually visible as it
    // travels, not masked by a simultaneous fade. A small vertical shake
    // rides along the same path (never rotation/curving, just a jitter on
    // the y-axis) to sell the vibration of gathering speed.
    tl.to(iconEl, { scale: 1.5, duration: 0.26, ease: 'power1.out' }, 0.32)
    tl.to(group, { x: 14, duration: 0.26, ease: 'power2.out' }, 0.32)
    tl.to(group, { y: -3, duration: 0.05, ease: 'sine.inOut' }, 0.32)
    tl.to(group, { y: 2, duration: 0.05, ease: 'sine.inOut' }, 0.37)
    tl.to(group, { y: -2, duration: 0.05, ease: 'sine.inOut' }, 0.42)
    tl.to(group, { y: 1, duration: 0.05, ease: 'sine.inOut' }, 0.47)
    tl.to(group, { y: 0, duration: 0.05, ease: 'sine.inOut' }, 0.52)

    // each line grows from a short stub near the icon out to its full
    // length WHILE the icon is moving — the elongation itself is what
    // reads as gathering speed, not an instant full-length snap — and each
    // starts at its own slightly offset moment for an irregular ripple
    // rather than a single uniform sweep
    LINES.forEach((cfg, i) => {
      const el = lineEls[i]
      if (!el) return
      tl.fromTo(
        el,
        { scaleX: 0.15, scaleY: 0.6, opacity: cfg.opacity * 0.4 },
        { scaleX: 1, scaleY: 1, opacity: cfg.opacity, duration: 0.24, ease: 'power2.out' },
        0.32 + cfg.delay,
      )
    })

    // a beat to actually register the burst, then icon + lines launch off
    // together and the real navigation (or new-tab open) fires as they vanish
    // — the icon is already at its biggest by now, so this is just a fade,
    // not a shrink; it stays large all the way out rather than receding
    tl.to(iconEl, { opacity: 0, duration: 0.16, ease: 'power2.in' }, 0.66)
    tl.to(group, { x: 30, duration: 0.16, ease: 'power2.in' }, 0.66)
    tl.to(lineEls, { scaleX: 1.6, opacity: 0, duration: 0.16, ease: 'power2.in' }, 0.66)
    tl.call(() => fire(), [], 0.76)

    // reset for next time and roll the label back in
    tl.set(burst, { opacity: 0 }, 0.84)
    tl.set(group, { x: 0, y: 0 }, 0.84)
    tl.set(iconEl, { scale: 0.3, opacity: 0 }, 0.84)
    tl.set(lineEls, { scaleX: 0.15, scaleY: 0.6, opacity: 0 }, 0.84)
    tl.to(labelEl, { yPercent: 0, opacity: 1, duration: 0.2, ease: 'power3.out' }, 0.86)
  }

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      data-cursor-hover
      onClick={handleClick}
      className={`relative isolate overflow-hidden ${className}`}
    >
      <span ref={labelRef} className="relative z-10 block">
        {label}
      </span>
      <span
        ref={burstRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0"
      >
        <span ref={groupRef} className="relative flex items-center justify-center">
          <span className="absolute right-full top-1/2 mr-1">
            {LINES.map((cfg, i) => (
              <span
                key={i}
                ref={(el) => {
                  lineRefs.current[i] = el
                }}
                className="absolute right-0 origin-right rounded-full bg-accent-fg opacity-0"
                style={{
                  top: cfg.y,
                  width: cfg.length,
                  height: cfg.thickness,
                  marginTop: -cfg.thickness / 2,
                }}
              />
            ))}
          </span>
          <span ref={iconRef} className="flex items-center justify-center">
            <Icon className="h-4 w-4 text-accent-fg" />
          </span>
        </span>
      </span>
    </a>
  )
}
