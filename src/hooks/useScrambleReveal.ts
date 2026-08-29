import { useEffect, useRef, useState } from 'react'

import { gsap } from '@/lib/gsap'
import { SCRAMBLE_CHARS } from '@/lib/scrambleChars'

interface ScrambleRevealOptions {
  trigger: boolean
  duration?: number
  delay?: number
  speed?: number
  revealDelay?: number
  onDone?: () => void
}

/**
 * Drives the same GSAP ScrambleTextPlugin the intro loader uses, but reads
 * the in-progress string back out on every tick instead of letting it paint
 * to a DOM node — so a WebGL-rasterized target (WarpText's canvas) can be
 * fed the same reload-style character cycling. The scramble runs against a
 * detached span that's never attached to the document.
 */
export function useScrambleReveal(
  target: string,
  { trigger, duration = 0.8, delay = 0, speed = 0.35, revealDelay = 0.1, onDone }: ScrambleRevealOptions,
) {
  const [text, setText] = useState(target)
  const dummyRef = useRef<HTMLSpanElement | null>(null)
  if (!dummyRef.current) dummyRef.current = document.createElement('span')

  useEffect(() => {
    if (!trigger) return undefined

    const el = dummyRef.current!
    el.textContent = ''
    const tween = gsap.to(el, {
      duration,
      delay,
      scrambleText: { text: target, chars: SCRAMBLE_CHARS, speed, revealDelay },
      ease: 'none',
      onUpdate: () => setText(el.textContent || target),
      onComplete: () => {
        setText(target)
        onDone?.()
      },
    })

    return () => {
      tween.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, target])

  return text
}
