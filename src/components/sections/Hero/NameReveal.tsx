import { useEffect, useRef } from 'react'

import { gsap, SplitText } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface NameRevealProps {
  text: string
  /** start the reveal animation (chained off the intro loader finishing) */
  play: boolean
  className?: string
}

export function NameReveal({ text, play, className = '' }: NameRevealProps) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    if (reducedMotion) {
      gsap.set(el, { opacity: 1 })
      return
    }

    if (!play) return

    const split = new SplitText(el, { type: 'chars', charsClass: 'name-reveal-char' })

    gsap.set(el, { opacity: 1 })
    gsap.set(split.chars, { yPercent: 120, rotateX: -70, opacity: 0 })

    const tween = gsap.to(split.chars, {
      yPercent: 0,
      rotateX: 0,
      opacity: 1,
      duration: 1,
      ease: 'power4.out',
      stagger: 0.045,
    })

    return () => {
      tween.kill()
      split.revert()
    }
  }, [play, reducedMotion, text])

  return (
    <span
      ref={wrapRef}
      className={`inline-block opacity-0 [perspective:800px] ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {text}
    </span>
  )
}
