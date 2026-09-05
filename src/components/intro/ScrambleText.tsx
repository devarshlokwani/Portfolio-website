import { useEffect, useRef } from 'react'

import { gsap } from '@/lib/gsap'
import { SCRAMBLE_CHARS } from '@/lib/scrambleChars'

interface ScrambleTextProps {
  words: string[]
  onDone: () => void
  /** skip straight to onDone with no animation (repeat-visit fast path) */
  skip?: boolean
  className?: string
  /** per-word class overrides, index-aligned with `words`, swapped in as each word starts scrambling in, replacing (not adding to) the base className for that word. An empty/missing entry falls back to the base className. */
  wordClassNames?: (string | undefined)[]
}

/** Cycles through `words`, scrambling from one to the next, then calls onDone. */
export function ScrambleText({
  words,
  onDone,
  skip = false,
  className = '',
  wordClassNames,
}: ScrambleTextProps) {
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
        scrambleText: { text: word, chars: SCRAMBLE_CHARS, speed: 0.4, revealDelay: 0.15 },
        ease: 'none',
        onStart: () => {
          // Reset to the base className each word, then layer this word's
          // override on top: avoids overrides accumulating across words.
          el.className = className
          const override = wordClassNames?.[i]
          if (override) el.classList.add(...override.split(' ').filter(Boolean))
        },
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
