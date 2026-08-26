import { useEffect, useRef } from 'react'

import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Options {
  y?: number
  duration?: number
  delay?: number
  /** selector (within the root element) for children to stagger in, instead of animating the root itself */
  stagger?: string
}

/** Fades/slides an element (or its staggered children) in as it enters the viewport. */
export function useScrollReveal<T extends HTMLElement>({
  y = 40,
  duration = 0.9,
  delay = 0,
  stagger,
}: Options = {}) {
  const ref = useRef<T | null>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const targets = stagger ? el.querySelectorAll(stagger) : el

    if (reducedMotion) {
      gsap.set(targets, { opacity: 1, y: 0 })
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: 'power3.out',
          stagger: stagger ? 0.08 : 0,
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
            once: true,
          },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [reducedMotion, y, duration, delay, stagger])

  return ref
}
