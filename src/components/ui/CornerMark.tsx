import { useRef } from 'react'

import { useLenisInstance } from '@/hooks/useLenisInstance'
import { gsap } from '@/lib/gsap'
import { smoothScrollToHash } from '@/lib/smoothScroll'

const SHORT = 'DL'
const LONG = 'Devarsh Lokwani'

export function CornerMark() {
  const lenisRef = useLenisInstance()
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
        if (smoothScrollToHash(lenisRef.current, '#hero', 0)) e.preventDefault()
      }}
      className="fixed left-5 top-5 z-50 flex h-8 items-center overflow-hidden font-mono text-sm tracking-wide text-fg md:left-8 md:top-8"
      aria-label="Devarsh Lokwani — back to top"
    >
      <span className="relative block h-full w-40">
        <span ref={shortRef} className="absolute inset-0 flex items-center whitespace-nowrap opacity-100">
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
