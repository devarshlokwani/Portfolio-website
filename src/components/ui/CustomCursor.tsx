import { useEffect, useRef } from 'react'

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
 * query — hybrid touchscreen laptops routinely report `pointer: coarse`
 * even with a mouse attached, which would otherwise disable this
 * permanently. A touch pointerdown flips it back off so hybrid devices
 * degrade to the native cursor.
 */
export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

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

    const disable = () => {
      if (!mouseActive) return
      mouseActive = false
      document.documentElement.classList.remove('custom-cursor-active')
      gsap.to(root, { opacity: 0, duration: 0.2 })
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
      if ((e.target as Element)?.closest?.(INTERACTIVE_SELECTOR)) {
        root.classList.add('cursor--hover')
      }
    }
    const onOut = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if ((e.target as Element)?.closest?.(INTERACTIVE_SELECTOR)) {
        root.classList.remove('cursor--hover')
      }
    }
    const onLeaveWindow = () => gsap.to(root, { opacity: 0, duration: 0.2 })
    const onEnterWindow = () => {
      if (mouseActive) gsap.to(root, { opacity: 1, duration: 0.2 })
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    document.addEventListener('mouseleave', onLeaveWindow)
    document.addEventListener('mouseenter', onEnterWindow)

    return () => {
      document.documentElement.classList.remove('custom-cursor-active')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      document.removeEventListener('mouseleave', onLeaveWindow)
      document.removeEventListener('mouseenter', onEnterWindow)
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
      </div>
    </div>
  )
}
