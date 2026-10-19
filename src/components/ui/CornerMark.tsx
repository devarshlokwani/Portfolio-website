import { useRef } from 'react'

import { useRouteTransition } from '@/app/routeTransition'
import { gsap } from '@/lib/gsap'

const SHORT = 'DL'
const LONG = 'Devarsh Lokwani'

export function CornerMark() {
  const { goTo } = useRouteTransition()
  const shortRef = useRef<HTMLSpanElement>(null)
  const longRef = useRef<HTMLSpanElement>(null)

  const onEnter = () => {
    gsap.to(shortRef.current, { yPercent: -100, opacity: 0, duration: 0.35, ease: 'power3.out' })
    gsap.to(longRef.current, { yPercent: -100, opacity: 1, duration: 0.35, ease: 'power3.out' })
  }

  const onLeave = () => {
    gsap.to(shortRef.current, { yPercent: 0, opacity: 1, duration: 0.35, ease: 'power3.out' })
    gsap.to(longRef.current, { yPercent: 0, opacity: 0, duration: 0.35, ease: 'power3.out' })
  }

  return (
    <a
      href="#hero"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={(e) => {
        e.preventDefault()
        goTo('/', { hash: '#hero' })
      }}
      // insets grow on wide screens so the mark tracks the page's margins
      // instead of stranding itself in the far corner
      className="fixed left-5 top-5 z-50 flex h-8 items-center overflow-hidden font-signature text-xl tracking-normal text-fg md:left-8 md:top-8 xl:left-20 xl:top-10 2xl:left-40"
      // Leads with the initials because they are what is on screen most of
      // the time. WCAG 2.5.3 asks that a control's accessible name contain
      // its visible label, and someone driving the page by voice says what
      // they can see, which here is "DL" until the mark is hovered.
      aria-label="DL Devarsh Lokwani, back to top"
    >
      {/* Decorative to a screen reader: both halves are in the markup at
          once, one sliding over the other on hover, and read out they would
          say the same name twice. The link is named by its aria-label
          instead, which is the one above. */}
      <span aria-hidden="true" className="relative block h-full w-[11.5rem]">
        <span
          ref={shortRef}
          className="absolute inset-0 flex items-center whitespace-nowrap opacity-100"
        >
          {SHORT}
        </span>
        <span
          ref={longRef}
          className="absolute inset-0 flex translate-y-full items-center whitespace-nowrap opacity-0"
        >
          {LONG}
        </span>
      </span>
    </a>
  )
}
