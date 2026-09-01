import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useHeroTransitionRegistry } from '@/app/HeroTransitionProvider'
import { useLenisInstance } from '@/hooks/useLenisInstance'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap, ScrollTrigger } from '@/lib/gsap'

interface GoToOptions {
  /** scroll to this hash on the destination page once it's mounted */
  hash?: string
}

interface RouteTransitionContextValue {
  goTo: (path: string, opts?: GoToOptions) => void
}

const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null)

export function useRouteTransition() {
  const ctx = useContext(RouteTransitionContext)
  if (!ctx) throw new Error('useRouteTransition must be used within a RouteTransitionProvider')
  return ctx
}

/**
 * Owns navigation between routes. For Home → Experience specifically, while
 * the Hero is actually on screen to run it, the page swap is deferred until
 * Hero's own race-exit animation finishes (see HeroTransitionProvider) —
 * that's the flagship transition, but it depends on Hero's own DOM (the
 * name morphing into "MY WORK"), so it only ever applies from that one
 * screen. Every other transition (Work → Home, or Work from anywhere the
 * Hero isn't in view/mounted — e.g. clicking it while scrolled down to
 * Contact) goes through a generic full-screen wipe instead of navigating
 * instantly: an accent-colored panel sweeps down to fully cover the
 * viewport, the route swap happens hidden underneath it, then it continues
 * the same direction off the bottom to reveal the destination. Unlike the
 * Hero transition, this has no dependency on any particular page's
 * content, so it works from anywhere.
 */
export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const lenisRef = useLenisInstance()
  const reducedMotion = useReducedMotion()
  const { runHeroExit } = useHeroTransitionRegistry()
  const busyRef = useRef(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // The destination route may still be a frame or two from having mounted
  // its hash targets when this runs right after navigate(), so poll briefly
  // rather than assuming a single fixed delay is always enough.
  const landOnDestination = useCallback(
    (hash?: string, attemptsLeft = 15) => {
      if (hash) {
        const el = document.querySelector(hash)
        if (el instanceof HTMLElement) {
          lenisRef.current?.scrollTo(el, { immediate: true, offset: -100 })
          return
        }
        if (attemptsLeft > 0) {
          requestAnimationFrame(() => landOnDestination(hash, attemptsLeft - 1))
          return
        }
      }
      lenisRef.current?.scrollTo(0, { immediate: true })
    },
    [lenisRef],
  )

  const finishNavigate = useCallback(
    (path: string, hash?: string) => {
      navigate(path)
      requestAnimationFrame(() => {
        landOnDestination(hash)
        ScrollTrigger.refresh()
      })
    },
    [navigate, landOnDestination],
  )

  const runGlobalWipe = useCallback((onCovered: () => void) => {
    const overlay = overlayRef.current
    if (!overlay) {
      onCovered()
      return
    }

    busyRef.current = true
    gsap.set(overlay, { transformOrigin: 'top', scaleY: 0 })
    const tl = gsap.timeline({
      onComplete: () => {
        busyRef.current = false
      },
    })
    tl.to(overlay, { scaleY: 1, duration: 0.5, ease: 'power3.inOut' })
    tl.call(() => onCovered())
    // continuing off the bottom (not retracing back up) reads as one
    // continuous sweep rather than a bounce, and gives the destination
    // page a beat to actually paint before it's uncovered
    tl.set(overlay, { transformOrigin: 'bottom' })
    tl.to(overlay, { scaleY: 0, duration: 0.5, ease: 'power3.inOut' }, '+=0.08')
  }, [])

  const goTo = useCallback(
    (path: string, opts?: GoToOptions) => {
      if (busyRef.current) return

      if (location.pathname === path) {
        if (opts?.hash) lenisRef.current?.scrollTo(opts.hash, { offset: -100 })
        return
      }

      if (reducedMotion) {
        finishNavigate(path, opts?.hash)
        return
      }

      const handled = path === '/experience' ? runHeroExit(() => finishNavigate(path, opts?.hash)) : false
      if (handled) {
        busyRef.current = true
        // the hero animation's own completion drives finishNavigate; just
        // release the busy guard shortly after so a stray double-click
        // during the (short) animation window doesn't queue a second one
        setTimeout(() => {
          busyRef.current = false
        }, 1600)
        return
      }

      runGlobalWipe(() => finishNavigate(path, opts?.hash))
    },
    [location.pathname, reducedMotion, runHeroExit, finishNavigate, runGlobalWipe, lenisRef],
  )

  return (
    <RouteTransitionContext.Provider value={{ goTo }}>
      {children}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[300] bg-accent"
        style={{ transform: 'scaleY(0)' }}
      />
    </RouteTransitionContext.Provider>
  )
}
