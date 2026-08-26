import { useEffect, useRef } from 'react'

import { gsap } from '@/lib/gsap'

interface ScrambleTextProps {
  words: string[]
  onDone: () => void
  /** skip straight to onDone with no animation (repeat-visit fast path) */
  skip?: boolean
  className?: string
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%'

/** Cycles through `words`, scrambling from one to the next, then calls onDone. */
export function ScrambleText({ words, onDone, skip = false, className = '' }: ScrambleTextProps) {
  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (skip) {
      onDone()
      return
    }

    const el = textRef.current
    if (!el) return

    const tl = gsap.timeline({ onComplete: onDone })

    words.forEach((word, i) => {
      tl.to(el, {
        duration: 0.55,
        scrambleText: { text: word, chars: CHARS, speed: 0.4, revealDelay: 0.15 },
        ease: 'none',
      })
      if (i < words.length - 1) {
        tl.to({}, { duration: 0.25 }) // brief hold before scrambling to the next word
      }
    })

    tl.to(el, { duration: 0.35, opacity: 0, ease: 'power2.in' }, '+=0.35')

    return () => {
      tl.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip])

  if (skip) return null

  return (
    <span ref={textRef} className={className}>
      {words[0]}
    </span>
  )
}
