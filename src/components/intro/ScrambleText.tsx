import { useEffect, useRef } from 'react'

import { gsap } from '@/lib/gsap'

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

/**
 * A few narrow lowercase letters mixed into every pool, so a short word
 * still has something to cycle through.
 */
const FILLER = 'aeorsnc'

/**
 * What a word scrambles through on its way in: its own letters, plus the
 * filler.
 *
 * The shared `SCRAMBLE_CHARS` is capitals and symbols, which is right for
 * the mono and display faces that use it elsewhere. In this script face a
 * capital is nearly twice the width of a lowercase letter, so a word of
 * them measured up to 1.9x the finished word and the line's width lurched
 * every frame. Drawing from the word's own letters holds the widest frame
 * to about 1.1x, because it is the same letters in a different order.
 */
function poolFor(word: string) {
  return [...new Set((word.toLowerCase() + FILLER).replace(/[^a-z]/g, ''))].join('')
}

/** Reserves the finished word's width. Hidden, but still takes up space. */
const GHOST_CLASS = 'invisible block'

/**
 * The line that actually animates.
 *
 * Absolutely positioned at the left edge of the box the ghost reserves, and
 * given a width that never changes, which is what fixes two separate things.
 *
 * Laid out normally it was a shrink-to-fit box in a centred flex parent, so
 * its width was exactly its text's width. Every frame the scrambler changed
 * a character the width changed, and being centred, both edges moved by half
 * of that. Letters that had already resolved kept sliding around underneath
 * the ones still settling.
 *
 * The fixed width is for iOS. Safari repaints changing text by dirty
 * rectangle, and when an element's own box shrinks it can leave what it
 * painted at the old, wider size behind: the trail of half-letters off the
 * right of the word that only ever showed up on a real iPhone, never in a
 * desktop browser's phone emulation, because that is Chromium underneath and
 * repaints the whole element. A box that never resizes has no old size to
 * leave anything behind at.
 */
const ANIM_CLASS = 'absolute left-0 top-0 w-screen text-left [will-change:contents]'

/** Cycles through `words`, scrambling from one to the next, then calls onDone. */
export function ScrambleText({
  words,
  onDone,
  skip = false,
  className = '',
  wordClassNames,
}: ScrambleTextProps) {
  const textRef = useRef<HTMLSpanElement>(null)
  const ghostRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (skip) {
      onDone()
      return
    }

    const el = textRef.current
    const ghost = ghostRef.current
    if (!el || !ghost) return

    const tl = gsap.timeline({ onComplete: onDone })

    words.forEach((word, i) => {
      tl.to(el, {
        duration: 0.55,
        scrambleText: { text: word, chars: poolFor(word), speed: 0.4, revealDelay: 0.15 },
        ease: 'none',
        onStart: () => {
          // Both layers carry this word's own classes so the ghost measures
          // the same type the animation is drawn in. Set rather than added:
          // see the note on `wordClassNames`.
          const cls = wordClassNames?.[i] || className
          el.className = `${cls} ${ANIM_CLASS}`
          ghost.className = `${cls} ${GHOST_CLASS}`
          // The box is re-sized to the word being written, once, at the
          // moment the text is being replaced anyway, rather than on every
          // frame of it.
          ghost.textContent = word
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

  const first = wordClassNames?.[0] || className

  return (
    <span className="relative inline-block">
      <span ref={ghostRef} aria-hidden="true" className={`${first} ${GHOST_CLASS}`}>
        {words[0]}
      </span>
      <span ref={textRef} className={`${first} ${ANIM_CLASS}`}>
        {words[0]}
      </span>
    </span>
  )
}
