import { useEffect } from 'react'

/**
 * Keeps hover state honest while the page scrolls under a stationary cursor.
 *
 * A browser only re-runs its hit test on pointer input. Scroll the page
 * without moving the mouse and nothing is considered to have changed: the
 * card the pointer left stays hovered, its `mouseleave` never fires, and the
 * custom cursor keeps whatever badge it picked up, until the reader happens
 * to move the mouse again.
 *
 * The fix is to do the browser's job for it. Each frame the page moves, the
 * element under the last known pointer position is looked up, and when that
 * differs from the one we last reported, the `out`/`over` pair the browser
 * would have sent is dispatched by hand. That single pair drives everything
 * downstream: React derives `onMouseEnter`/`onMouseLeave` from `mouseover`
 * and `mouseout` at the root, and the custom cursor listens for
 * `pointerover`/`pointerout` on the document, so hover styles, expanding
 * rows and the cursor badge all correct together.
 *
 * `:hover` itself is the browser's own state and cannot be set from script.
 * Dropping `pointer-events` on the body for two frames forces it to re-run
 * the real hit test, which is what corrects the CSS half. Two frames, not
 * "until scrolling stops": the usual version of that trick swallows clicks
 * through a trackpad's momentum, and Lenis keeps easing long after the
 * reader has let go.
 */
export function useHoverSync() {
  useEffect(() => {
    const body = document.body
    let pointerX = -1
    let pointerY = -1
    /** The element we last told the page the pointer was over. */
    let reported: Element | null = null
    let frame = 0
    let restore = 0
    /**
     * True while pointer events are off for the nudge below. Dropping them
     * makes `elementFromPoint` answer with the root element, so a sync
     * running inside that window sees the pointer leave everything and says
     * so, then says the opposite again a frame later. That feedback loop
     * was the jitter: the nudge kept re-triggering the sync that started it.
     */
    let nudging = false

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointerX = e.clientX
      pointerY = e.clientY
      // The browser is handling it while the pointer moves, so just keep our
      // idea of the target in step rather than dispatching anything.
      reported = e.target as Element
    }

    const send = (target: Element, type: string, related: Element | null) => {
      const init: PointerEventInit = {
        bubbles: true,
        cancelable: false,
        composed: true,
        clientX: pointerX,
        clientY: pointerY,
        relatedTarget: related,
        pointerType: 'mouse',
        isPrimary: true,
      }
      target.dispatchEvent(new PointerEvent(type, init))
      // The mouse pair as well: React builds enter/leave from `mouseout` and
      // `mouseover`, and plenty of handlers still listen for those directly.
      target.dispatchEvent(new MouseEvent(type.replace('pointer', 'mouse'), init))
    }

    const sync = () => {
      if (pointerX < 0 || nudging) return
      const actual = document.elementFromPoint(pointerX, pointerY)
      if (actual === reported) return

      const from = reported
      reported = actual

      // Order matters: everything leaving is told first, so a handler
      // reacting to the new target cannot be undone by the old one's exit.
      if (from?.isConnected) send(from, 'pointerout', actual)
      if (actual) send(actual, 'pointerover', from)

      // And the nudge that re-runs the browser's own hit test, for `:hover`.
      cancelAnimationFrame(restore)
      nudging = true
      body.style.pointerEvents = 'none'
      // Reading a layout property applies the change, so the hit test really
      // re-runs before pointer events are handed back.
      void body.offsetHeight
      restore = requestAnimationFrame(() => {
        restore = requestAnimationFrame(() => {
          body.style.pointerEvents = ''
          nudging = false
        })
      })
    }

    /**
     * One check per frame, every frame the page is moving.
     *
     * Cancelling the pending frame on each scroll event and scheduling a
     * fresh one looks like the same thing but is the opposite: scroll fires
     * at least once per frame while the page moves, so the check was
     * postponed for as long as that continued and only ever ran once
     * scrolling stopped. Leaving an already-scheduled frame alone is what
     * makes it a throttle, and the hover follows the page as it travels
     * instead of catching up at the end.
     */
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        sync()
      })
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
      cancelAnimationFrame(frame)
      cancelAnimationFrame(restore)
      nudging = false
      // Never leave the page un-clickable if this unmounts mid-scroll.
      body.style.pointerEvents = ''
    }
  }, [])
}
