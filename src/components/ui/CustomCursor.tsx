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
    // Tracked so the arrow can be snapped back to the real pointer position
    // when it reappears, instead of easing in from wherever it froze.
    let lastX = 0
    let lastY = 0
    // The last step the pointer took. This is what the check below reads
    // once events stop arriving.
    let stepX = 0
    let stepY = 0
    // A cross-origin iframe owns its own cursor: `cursor: none` doesn't reach
    // inside it and no pointermove reaches back out, so the native arrow
    // appears in there while ours freezes at the boundary. Rather than fight
    // that, hand the cursor over for as long as the pointer is inside one.
    let overFrame = false

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

    // Both directions swap in a single frame rather than cross-fading. A
    // fade means both arrows are on screen for its duration, and since the
    // frame's own native cursor appears the instant the pointer crosses in,
    // any fade at all is read as two cursors at once.
    const suspend = () => {
      if (overFrame) return
      overFrame = true
      gsap.killTweensOf(root)
      gsap.set(root, { opacity: 0 })
      document.documentElement.classList.remove('custom-cursor-active')
    }

    const resume = (x: number, y: number) => {
      if (!overFrame) return
      overFrame = false
      if (!mouseActive) return
      // Position first: without the snap it eases in from wherever it froze
      // on the way in, which reads as the cursor flying across the page to
      // catch up with a pointer that is already somewhere else.
      //
      // The snap needs both halves. `set` moves it this frame, but the
      // follow tweens carry their own start value and would pick the old
      // position straight back up, easing away from where it was just put,
      // so each is handed the new position as its start as well as its end.
      gsap.killTweensOf(root)
      gsap.set(cursor, { x, y })
      moveX(x, x)
      moveY(y, y)
      gsap.set(root, { opacity: 1 })
      document.documentElement.classList.add('custom-cursor-active')
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      stepX = e.clientX - lastX
      stepY = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      armIdleCheck()
      // Movement only reaches us while the pointer is outside every iframe,
      // so any move at all is the signal that it has come back out.
      if (overFrame) resume(e.clientX, e.clientY)
      if (!mouseActive) {
        // Primed the same way as `resume`, and for the same reason: the
        // pointer may have left the window on one side and come back on the
        // other, and the follow tweens would drag the arrow across.
        gsap.set(cursor, { x: e.clientX, y: e.clientY })
        moveX(e.clientX, e.clientX)
        moveY(e.clientY, e.clientY)
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
      // Coming back out of a frame, this lands a beat before the move that
      // follows it, and it carries a real position, so the arrow is already
      // in the right place by the time it is visible.
      if (overFrame) resume(e.clientX, e.clientY)
      const target = e.target as Element
      if (target?.closest?.(INTERACTIVE_SELECTOR)) {
        root.classList.add('cursor--hover')
      }
      const iconTarget = target?.closest?.<HTMLElement>('[data-cursor-icon]')
      if (iconTarget) {
        root.classList.add(`cursor--icon-${iconTarget.dataset.cursorIcon}`)
      }
    }
    /** Is a point inside any iframe currently on the page? */
    // Hit-tests a point down through shadow roots. Cal's embed puts its
    // iframe inside a custom element's shadow DOM, where a plain
    // `document.querySelectorAll('iframe')` cannot reach it and where
    // `elementFromPoint` stops at the host, so the search has to descend one
    // root at a time. The depth cap is just a guard against a cycle.
    const pointInFrame = (x: number, y: number) => {
      let root: Document | ShadowRoot = document
      for (let depth = 0; depth < 8; depth++) {
        const el: Element | null = root.elementFromPoint(x, y)
        if (!el) return false
        if (el.tagName === 'IFRAME') return true
        if (!el.shadowRoot) return false
        root = el.shadowRoot
      }
      return false
    }

    /**
     * The reliable half of the handover.
     *
     * Crossing into a cross-origin iframe is not announced at all: no
     * `pointerover` on the frame, no `pointerout` carrying a null
     * relatedTarget, and no entry in the document's `:hover` chain. All that
     * actually happens is that pointer events simply stop arriving, which is
     * why the arrow was being left parked wherever it crossed the edge.
     *
     * So the silence itself is the signal. When no move has arrived for a
     * moment, measured from the last event rather than sampled on a timer
     * so the check lands the instant the window elapses, the last position
     * the pointer was seen at is checked against
     * every frame on the page. That position is never actually inside a
     * frame, it is the sample taken just before the crossing, so how far
     * short it falls depends entirely on how fast the pointer was going:
     * a drift stops within a pixel or two of the edge, a flick can clear a
     * few hundred. Judging that gap against the size of the pointer's own
     * last step is what covers both, and it is also what keeps a cursor
     * resting near the calendar from being read as one inside it, since a
     * pointer that has come to rest has short steps and so almost no reach.
     * The step has to point at the frame as well.
     *
     * A wrong guess costs a frame of native cursor and undoes itself on the
     * next pixel of movement, since any move at all means the pointer is
     * out here. That cheap, self-correcting failure is what lets the idle
     * window be as short as it is: the whole handover has to land inside the
     * moment the native arrow appears, and a mouse reports at well over
     * 60Hz, so two frames of silence already means the pointer is gone.
     */
    const IDLE_MS = 26

    const sweepFrames = () => {
      if (overFrame || !mouseActive) return

      // How much further one more step of the same size could have carried
      // it, plus a few pixels for a pointer that had all but stopped.
      const reach = Math.hypot(stepX, stepY) * 1.4 + 2

      for (const frame of document.getElementsByTagName('iframe')) {
        const r = frame.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        // Vector from where the pointer was last seen to the nearest point
        // on the frame. Zero when it is already within the frame's box.
        const dx = Math.min(Math.max(lastX, r.left), r.right) - lastX
        const dy = Math.min(Math.max(lastY, r.top), r.bottom) - lastY
        const gap = Math.hypot(dx, dy)
        if (gap > reach) continue
        if (gap === 0 || stepX * dx + stepY * dy > 0) {
          suspend()
          return
        }
      }
    }

    // Armed by every move and disarmed by the next one, so it only ever
    // fires on the move that turned out to be the last one.
    let idleTimer: ReturnType<typeof setTimeout> | null = null
    const armIdleCheck = () => {
      if (idleTimer) clearTimeout(idleTimer)
      idleTimer = setTimeout(sweepFrames, IDLE_MS)
    }

    const onOut = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      // Kept as the fast path: where a browser does report the crossing, the
      // handover happens on the event rather than waiting out the sweep.
      if (pointInFrame(e.clientX, e.clientY)) suspend()
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
    // Clicking into an iframe moves focus without firing pointerover out
    // here, so the blur is the only signal that the pointer went in.
    const onBlur = () => {
      if (document.activeElement?.tagName === 'IFRAME') suspend()
    }
    // There is deliberately no counterpart to `onBlur` here. Window focus
    // returning says nothing about where the pointer is, only that it is
    // somewhere, and the only position on hand is the one remembered from
    // before it entered the frame. Showing the arrow there is what made it
    // fly across the page: it appeared back at the point of entry and then
    // eased over to wherever the pointer had actually come out. Staying
    // hidden until a real event carries a real position costs nothing,
    // since the native cursor is showing in the meantime.

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    document.addEventListener('mouseleave', onLeaveWindow)
    window.addEventListener('blur', onBlur)

    return () => {
      if (idleTimer) clearTimeout(idleTimer)
      document.documentElement.classList.remove('custom-cursor-active')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      document.removeEventListener('mouseleave', onLeaveWindow)
      window.removeEventListener('blur', onBlur)
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
