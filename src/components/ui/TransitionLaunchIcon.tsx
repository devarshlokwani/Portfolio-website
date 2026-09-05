import { forwardRef, useImperativeHandle, useRef, type RefObject } from 'react'
import { TbBriefcase2, TbHome2, TbMail } from 'react-icons/tb'
import type { IconType } from 'react-icons'

import { gsap } from '@/lib/gsap'

export type TransitionDirection = 'work' | 'contact' | 'home'

/**
 * One icon per destination. `home` is also the fallback for anything without
 * its own mark: the legal pages.
 *
 * Contact gets an envelope rather than a handset: the page is a message form
 * and an email address, and a phone icon would promise a channel that isn't
 * actually on offer. It also matches the mail icon the hero's "Get in Touch"
 * button already uses.
 */
const ICONS: Record<TransitionDirection, IconType> = {
  work: TbBriefcase2,
  contact: TbMail,
  home: TbHome2,
}

export interface TransitionLaunchIconHandle {
  /** Starts the pop-and-launch burst for whichever icon matches the
   *  destination. */
  show: (direction: TransitionDirection) => void
  hide: () => void
}

// Trailing behind a leftward launch (opposite of the CTA buttons' own
// rightward one: this rides the same leftward direction the wall itself
// exits in), longest line through the center, shorter ones above/below.
const LINES = [
  { y: -11, length: 30, thickness: 3 },
  { y: 0, length: 42, thickness: 3.5 },
  { y: 11, length: 30, thickness: 3 },
]

interface BurstHandle {
  play: () => void
  reset: () => void
}

function useBurst(): BurstHandle & {
  groupRef: RefObject<HTMLSpanElement | null>
  iconRef: RefObject<HTMLSpanElement | null>
  lineRefs: RefObject<(HTMLSpanElement | null)[]>
} {
  const groupRef = useRef<HTMLSpanElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const reset = () => {
    tlRef.current?.kill()
    const group = groupRef.current
    const icon = iconRef.current
    const lines = lineRefs.current
    if (group) gsap.set(group, { x: 0, y: 0 })
    if (icon) gsap.set(icon, { scale: 0.3, opacity: 0 })
    if (lines.length && lines.every(Boolean)) gsap.set(lines, { scaleX: 0.15, opacity: 0 })
  }

  const play = () => {
    reset()
    const group = groupRef.current
    const icon = iconRef.current
    const lines = lineRefs.current
    if (!group || !icon || lines.some((el) => !el)) return

    // Same shape as the CTA buttons' own useSpeedLaunch (small -> grow ->
    // shift-with-jitter while lines extend -> fade+continue with lines
    // stretching further), just mirrored to travel left instead of right
    // and re-timed to fit the ~0.55s the wall actually keeps this on
    // screen, instead of the button version's ~0.8s (which has no such
    // window to fit inside).
    const tl = gsap.timeline()
    tlRef.current = tl

    tl.to(icon, { scale: 1, opacity: 1, duration: 0.15, ease: 'power2.out' }, 0)
    tl.to(icon, { scale: 1.55, duration: 0.17, ease: 'power1.out' }, 0.15)
    tl.to(group, { x: -22, duration: 0.17, ease: 'power2.out' }, 0.15)
    tl.to(group, { y: -4, duration: 0.04, ease: 'sine.inOut' }, 0.15)
    tl.to(group, { y: 3, duration: 0.04, ease: 'sine.inOut' }, 0.19)
    tl.to(group, { y: -3, duration: 0.04, ease: 'sine.inOut' }, 0.23)
    tl.to(group, { y: 0, duration: 0.04, ease: 'sine.inOut' }, 0.27)

    LINES.forEach((_, i) => {
      const el = lines[i]
      if (!el) return
      tl.fromTo(
        el,
        { scaleX: 0.15, opacity: 0.35 },
        { scaleX: 1, opacity: 0.9, duration: 0.16, ease: 'power2.out' },
        0.15,
      )
    })

    tl.to(icon, { opacity: 0, duration: 0.13, ease: 'power2.in' }, 0.36)
    tl.to(group, { x: -40, duration: 0.13, ease: 'power2.in' }, 0.36)
    tl.to(lines, { scaleX: 1.5, opacity: 0, duration: 0.13, ease: 'power2.in' }, 0.36)
  }

  return { groupRef, iconRef, lineRefs, play, reset }
}

function Burst({
  Icon,
  groupRef,
  iconRef,
  lineRefs,
}: {
  Icon: IconType
  groupRef: RefObject<HTMLSpanElement | null>
  iconRef: RefObject<HTMLSpanElement | null>
  lineRefs: RefObject<(HTMLSpanElement | null)[]>
}) {
  return (
    <span
      ref={groupRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <span className="absolute left-full top-1/2 ml-1.5">
        {LINES.map((cfg, i) => (
          <span
            key={i}
            ref={(el) => {
              lineRefs.current[i] = el
            }}
            className="absolute left-0 origin-left rounded-full opacity-0"
            style={{
              top: cfg.y,
              width: cfg.length,
              height: cfg.thickness,
              marginTop: -cfg.thickness / 2,
              backgroundColor: 'var(--color-accent-fg)',
            }}
          />
        ))}
      </span>
      <span ref={iconRef} className="flex items-center justify-center opacity-0">
        <Icon className="h-10 w-10 md:h-14 md:w-14" style={{ color: 'var(--color-accent-fg)' }} />
      </span>
    </span>
  )
}

/**
 * The content-aware launch mark shown centered in the viewport
 * mid-transition: see RouteTransitionProvider, which owns exactly when it
 * shows/hides relative to the sweeping wall's own position, and picks the
 * direction from the destination route.
 *
 * One burst per destination sits stacked in the same spot, each driven by its
 * own useBurst() instance. show() plays the matching one and explicitly
 * resets every other, so a burst left mid-flight by an interrupted navigation
 * can never bleed into the next transition.
 */
export const TransitionLaunchIcon = forwardRef<TransitionLaunchIconHandle>(function TransitionLaunchIcon(_props, ref) {
  const rootRef = useRef<HTMLDivElement>(null)

  // Called unconditionally and in a fixed order. One per key of ICONS.
  const bursts: Record<TransitionDirection, ReturnType<typeof useBurst>> = {
    work: useBurst(),
    contact: useBurst(),
    home: useBurst(),
  }
  const directions = Object.keys(ICONS) as TransitionDirection[]

  useImperativeHandle(ref, () => ({
    show: (direction) => {
      if (rootRef.current) gsap.set(rootRef.current, { visibility: 'visible' })
      directions.forEach((key) => {
        if (key === direction) bursts[key].play()
        else bursts[key].reset()
      })
    },
    hide: () => {
      if (rootRef.current) gsap.set(rootRef.current, { visibility: 'hidden' })
      directions.forEach((key) => bursts[key].reset())
    },
  }))

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      style={{ visibility: 'hidden' }}
      className="pointer-events-none fixed inset-0 z-[301] flex items-center justify-center"
    >
      <div className="relative h-20 w-20 md:h-28 md:w-28">
        {directions.map((key) => (
          <Burst
            key={key}
            Icon={ICONS[key]}
            groupRef={bursts[key].groupRef}
            iconRef={bursts[key].iconRef}
            lineRefs={bursts[key].lineRefs}
          />
        ))}
      </div>
    </div>
  )
})
