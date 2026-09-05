import { useEffect, useId, useRef } from 'react'

import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, [role="button"], [data-cursor-hover]'

/**
 * Custom cursor: a redesigned arrow glyph that replaces the native pointer,
 * with a two-tone fg-fill/bg-stroke so it stays legible over any content in
 * either theme. Tracks the pointer with a very short eased glide (smooth,
 * not laggy) and grows/tints on interactive hover, presses on click.
 *
 * Enabling is decided from live pointer events (first "mouse"-typed
 * pointermove) rather than a `(hover: hover) and (pointer: fine)` media
 * query: hybrid touchscreen laptops routinely report `pointer: coarse`
 * even with a mouse attached, which would otherwise disable this
 * permanently. A touch pointerdown flips it back off so hybrid devices
 * degrade to the native cursor.
 */
export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const ringTextPathId = useId()

  useEffect(() => {
    const root = rootRef.current
    const cursor = cursorRef.current
    if (!root || !cursor) return

    const lag = reducedMotion ? 0 : 0.13

    const moveX = gsap.quickTo(cursor, 'x', { duration: lag, ease: 'power3' })
    const moveY = gsap.quickTo(cursor, 'y', { duration: lag, ease: 'power3' })

    let mouseActive = false

    const enable = () => {
      if (mouseActive) return
      mouseActive = true
      document.documentElement.classList.add('custom-cursor-active')
      gsap.to(root, { opacity: 1, duration: 0.2 })
    }

    // Instant, not a fade: leaving the window means the real OS cursor is
    // immediately visible out there, so any lingering fade on ours reads as
    // lag. Only `root`'s opacity tween is killed here, `cursor`'s x/y are
    // owned by the quickTo functions above, and externally killing their
    // tweens breaks quickTo's internal reference to them permanently (every
    // future moveX/moveY call becomes a no-op), which is what was freezing
    // the arrow in place while the native cursor showed through underneath.
    const disable = () => {
      if (!mouseActive) return
      mouseActive = false
      document.documentElement.classList.remove('custom-cursor-active')
      gsap.killTweensOf(root)
      gsap.set(root, { opacity: 0 })
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (!mouseActive) {
        gsap.set(cursor, { x: e.clientX, y: e.clientY })
        enable()
        return
      }
      moveX(e.clientX)
      moveY(e.clientY)
    }

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        disable()
        return
      }
      root.classList.add('cursor--down')
    }
    const onUp = () => root.classList.remove('cursor--down')

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const target = e.target as Element
      if (target?.closest?.(INTERACTIVE_SELECTOR)) {
        root.classList.add('cursor--hover')
      }
      const iconTarget = target?.closest?.<HTMLElement>('[data-cursor-icon]')
      if (iconTarget) {
        root.classList.add(`cursor--icon-${iconTarget.dataset.cursorIcon}`)
      }
    }
    const onOut = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const target = e.target as Element
      if (target?.closest?.(INTERACTIVE_SELECTOR)) {
        root.classList.remove('cursor--hover')
      }
      const iconTarget = target?.closest?.<HTMLElement>('[data-cursor-icon]')
      if (iconTarget) {
        root.classList.remove(`cursor--icon-${iconTarget.dataset.cursorIcon}`)
      }
    }
    // No separate mouseenter handler needed: onMove's !mouseActive branch
    // already re-primes position instantly (via gsap.set, not an eased
    // tween) the moment a real pointermove arrives after re-entering.
    const onLeaveWindow = () => disable()

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    document.addEventListener('mouseleave', onLeaveWindow)

    return () => {
      document.documentElement.classList.remove('custom-cursor-active')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      document.removeEventListener('mouseleave', onLeaveWindow)
    }
  }, [reducedMotion])

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 z-[200] opacity-0" aria-hidden="true">
      <div ref={cursorRef} className="cursor-anchor">
        <svg className="cursor-arrow" viewBox="0 0 24 24">
          <path className="cursor-arrow-outline" d="M4 3 L4 19 L9.5 14.5 L17 14.5 Z" />
          <path className="cursor-arrow-facet-a" d="M4 3 L4 19 L9.5 14.5 Z" />
          <path className="cursor-arrow-facet-b" d="M4 3 L9.5 14.5 L17 14.5 Z" />
        </svg>
        {/* Swapped in over the Foundr screenshot showcase (see
            data-cursor-icon="foundr" in FoundrScreens.tsx) in place of the
            arrow: a dark greyscale ring: slightly larger than, and
            centered behind, the green "F" disc, with "VIEW MORE" curving
            around the band between them. */}
        <div className="cursor-icon-badge cursor-icon-badge--foundr">
          <svg className="cursor-icon-badge__ring" viewBox="0 0 96 96">
            <circle className="cursor-icon-badge__ring-bg" cx="48" cy="48" r="47" />
            <defs>
              {/* Short arcs centered exactly on the top and bottom points
                  (not full semicircles: a semicircle left "VIEW MORE"
                  centered via startOffset but still stretching most of the
                  way around to the sides, reading as a left/right split
                  rather than top/bottom): traced in opposite directions so
                  each label's "up" faces outward and reads upright, rather
                  than the bottom copy coming out upside down. */}
              <path id={`${ringTextPathId}-top`} d="M 19.7,24.2 A 37,37 0 0 1 76.3,24.2" />
              <path id={`${ringTextPathId}-bottom`} d="M 76.3,71.8 A 37,37 0 0 1 19.7,71.8" />
            </defs>
            <text className="cursor-icon-badge__ring-text" textAnchor="middle">
              <textPath href={`#${ringTextPathId}-top`} startOffset="50%">
                VIEW MORE
              </textPath>
            </text>
            <text className="cursor-icon-badge__ring-text" textAnchor="middle">
              <textPath href={`#${ringTextPathId}-bottom`} startOffset="50%">
                VIEW MORE
              </textPath>
            </text>
            {/* Separator dots at 3 and 9 o'clock, equal distance from both
                labels, in the gaps left and right between the top and
                bottom arcs, for a finished, intentional-looking break. */}
            <circle className="cursor-icon-badge__ring-dot" cx="85" cy="48" r="3" />
            <circle className="cursor-icon-badge__ring-dot" cx="11" cy="48" r="3" />
          </svg>
          <span className="cursor-icon-badge__mark">F</span>
        </div>
      </div>
    </div>
  )
}
