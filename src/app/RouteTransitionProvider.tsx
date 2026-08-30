import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useHeroTransitionRegistry } from '@/app/HeroTransitionProvider'
import { useLenisInstance } from '@/hooks/useLenisInstance'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ScrollTrigger } from '@/lib/gsap'

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
 * Owns navigation between routes. For Home → Experience specifically, the
 * actual page swap is deferred until Hero's own race-exit animation
 * finishes (see HeroTransitionProvider) — everything else just navigates
 * and lands on the right scroll position directly.
 */
export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const lenisRef = useLenisInstance()
  const reducedMotion = useReducedMotion()
  const { runHeroExit } = useHeroTransitionRegistry()
  const busyRef = useRef(false)

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

      finishNavigate(path, opts?.hash)
    },
    [location.pathname, reducedMotion, runHeroExit, finishNavigate, lenisRef],
  )

  return <RouteTransitionContext.Provider value={{ goTo }}>{children}</RouteTransitionContext.Provider>
}
