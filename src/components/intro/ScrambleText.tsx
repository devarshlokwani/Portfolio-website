import { useEffect, useRef } from 'react'

import { gsap } from '@/lib/gsap'
import { SCRAMBLE_CHARS } from '@/lib/scrambleChars'

interface ScrambleTextProps {
  words: string[]
  onDone: () => void
  /** skip straight to onDone with no animation (repeat-visit fast path) */
  skip?: boolean
  className?: string
  /**
   * Per-word class overrides, index-aligned with `words`, swapped in as each
   * word starts scrambling in. An entry replaces the base className outright
   * for that word, so it has to be a complete class list and not just the
   * parts that differ. A missing or empty entry falls back to the base.
   */
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
          // The override replaces the base outright rather than layering on
          // top of it. Adding both left the two sets fighting, and which won
          // came down to the order Tailwind happens to emit its utilities in
          // rather than to intent: the base's `uppercase`, `font-semibold`
          // and `tracking-tight` were all quietly beating the override's
          // `normal-case`, `font-normal` and `tracking-normal`, so the script
          // face rendered in tight semibold caps. An override is therefore a
          // whole class list, not a patch on one.
          el.className = wordClassNames?.[i] || className
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
    // The first word's own classes, not the base, so the opening frame is
    // already in the face it animates in rather than flipping on the first
    // tick.
    <span ref={textRef} className={wordClassNames?.[0] || className}>
      {words[0]}
    </span>
  )
}
