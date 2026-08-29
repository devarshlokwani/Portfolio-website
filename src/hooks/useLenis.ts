import Lenis from 'lenis'
import { useEffect, useRef } from 'react'

import { gsap, ScrollTrigger } from '@/lib/gsap'

/**
 * Creates a single Lenis instance driven by GSAP's ticker (instead of Lenis's
 * own rAF loop) so smooth-scroll and ScrollTrigger never desync. Returns the
 * instance so callers (e.g. the intro loader) can stop()/start() it without
 * destroying/recreating it.
 */
export function useLenis(enabled: boolean) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (!enabled) return

    const lenis = new Lenis({
      duration: 0.75,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [enabled])

  return lenisRef
}
