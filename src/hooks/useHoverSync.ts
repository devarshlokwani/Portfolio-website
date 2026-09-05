import { useEffect } from 'react'

/** How often to check mid-scroll, and how long after the last scroll frame to
 *  do a final check once Lenis has eased to a stop. */
const THROTTLE_MS = 80
const SETTLE_MS = 120

/**
 * Keeps `:hover` honest while the page scrolls under a stationary cursor.
 *
 * A browser re-runs its hit test on pointer input and on user-driven scrolls.
 * Lenis swallows the wheel event and scrolls the window itself, frame by
 * frame, so on some engines nothing at the pointer is considered to have
 * changed: whatever was hovered when the cursor last moved stays hovered,
 * even once it has scrolled off screen, and only corrects on the next mouse
 * move. It affects every hover on the site (CSS and JS alike) because
 * `mouseleave` doesn't fire either.
 *
 * The check is cheap and exact: compare the deepest element the document
 * *thinks* is hovered against whatever is really under the last known cursor
 * position. They agree almost always, and nothing happens. When they don't,
 * dropping `pointer-events` on the body and reading back a layout property
 * forces the hit test to re-run; restoring it re-runs it again at the real
 * position, which resolves `:hover`, `mouseenter`/`mouseleave`, and the
 * custom cursor together.
 *
 * Pointer events come back after two frames rather than being held off for
 * the whole scroll: the common version of this trick disables them until
 * scrolling stops, which silently swallows clicks through a trackpad's
 * momentum, and Lenis keeps easing long after the reader has let go.
 */
export function useHoverSync() {
  useEffect(() => {
    const body = document.body
    let pointerX = -1
    let pointerY = -1
    let raf = 0
    let last = 0
    let settle: ReturnType<typeof setTimeout> | null = null

    const onPointerMove = (e: PointerEvent) => {
      pointerX = e.clientX
      pointerY = e.clientY
    }

    const isStale = () => {
      if (pointerX < 0) return false
      const chain = document.querySelectorAll(':hover')
      const believed = chain.length ? chain[chain.length - 1] : null
      const actual = document.elementFromPoint(pointerX, pointerY)
      return believed !== actual
    }

    const flush = () => {
      if (!isStale()) return
      cancelAnimationFrame(raf)
      body.style.pointerEvents = 'none'
      // reading a layout property applies the change, so the hit test really
      // re-runs before pointer events are handed back
      void body.offsetHeight
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          body.style.pointerEvents = ''
        })
      })
    }

    const onScroll = () => {
      const now = performance.now()
      if (now - last > THROTTLE_MS) {
        last = now
        flush()
      }
      if (settle) clearTimeout(settle)
      settle = setTimeout(flush, SETTLE_MS)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    // `scroll` covers Lenis's own frame-by-frame scrolling; `wheel` and
    // `touchmove` catch engines that suppress scroll events while a smooth
    // scroll library is driving.
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onScroll, { passive: true })
    window.addEventListener('touchmove', onScroll, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onScroll)
      window.removeEventListener('touchmove', onScroll)
      cancelAnimationFrame(raf)
      if (settle) clearTimeout(settle)
      // never leave the page un-clickable if this unmounts mid-scroll
      body.style.pointerEvents = ''
    }
  }, [])
}
