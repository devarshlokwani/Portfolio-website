import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  TransitionLaunchIcon,
  type TransitionDirection,
  type TransitionLaunchIconHandle,
} from '@/components/ui/TransitionLaunchIcon'
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

// Positive skew shifts a point's x by +y*tan(angle) in the panel's local
// space (y growing downward) — since the panel sweeps in from the right
// (moving toward -x), a larger positive shift at the bottom means the
// bottom of the leading edge sits further right (less progressed) than the
// top at any instant, so the top-right corner is the first thing on screen.
/** Which launch mark each destination gets mid-wipe; anything absent falls
 *  back to 'home'. */
const ROUTE_DIRECTIONS: Record<string, TransitionDirection> = {
  '/experience': 'work',
  '/contact': 'contact',
}

const SKEW_DEG = 14
// The panel is oversized relative to the clipping wrapper (which is exactly
// viewport-sized) so the skewed corners still fully cover every edge at
// rest instead of leaving a gap: horizontal overscan needs to clear
// viewportHeight * tan(SKEW_DEG), which for a typical viewport is well
// under 20% of its width.
const PANEL_OVERSCAN = '20%'
const PANEL_WIDTH = '140%'

/**
 * Owns navigation between routes. Every cross-route navigation goes through
 * one global wipe transition: a skewed accent-colored panel sweeps in from
 * the right — its diagonal leading edge angled so the top-right corner
 * arrives first — to fully cover the viewport, the route swap happens
 * hidden underneath, then the panel continues the same direction off the
 * left to reveal the destination. The diagonal edge (vs. a flat one) is
 * what keeps this reading as a smooth directional sweep rather than a
 * blunt block wipe. Using one mechanism for both directions (rather than a
 * Hero-specific exit animation that only worked when Hero itself was on
 * screen) is what makes this work from anywhere on the site, not just from
 * the home hero.
 */
export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const lenisRef = useLenisInstance()
  const reducedMotion = useReducedMotion()
  const busyRef = useRef(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const launchRef = useRef<TransitionLaunchIconHandle>(null)

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

  const runGlobalWipe = useCallback((direction: TransitionDirection, onCovered: () => void) => {
    const overlay = overlayRef.current
    if (!overlay) {
      onCovered()
      return
    }

    busyRef.current = true
    // opacity (not a transform) hides the panel until this first `set` runs
    // — xPercent must be the *only* thing that ever establishes its
    // transform, since GSAP composes x/xPercent additively with whatever
    // transform was already on the element rather than replacing it, and a
    // pre-existing inline translateX would otherwise double up with this.
    gsap.set(overlay, { opacity: 1, skewX: SKEW_DEG, xPercent: 100 })
    const tl = gsap.timeline({
      onComplete: () => {
        busyRef.current = false
      },
    })
    tl.to(overlay, { xPercent: 0, duration: 0.5, ease: 'power3.inOut' })
    // With power3.inOut, xPercent (and so the wall's leading edge) crosses
    // its own halfway point at exactly half the tween's duration — that's
    // also where the diagonal edge clears the viewport's horizontal
    // center, so the launch icon's reveal is timed to that same instant
    // rather than a guessed fraction of the total transition.
    tl.call(() => launchRef.current?.show(direction), [], 0.25)
    tl.call(() => onCovered())
    // continuing off the left (not retracing back out the right) reads as
    // one continuous sweep rather than a bounce, and gives the destination
    // page a beat to actually paint before it's uncovered
    tl.addLabel('exit', '+=0.08')
    tl.to(overlay, { xPercent: -100, duration: 0.5, ease: 'power3.inOut' }, 'exit')
    // same halfway-point logic as the reveal, mirrored: the wall's
    // trailing edge clears center at the midpoint of this tween too
    tl.call(() => launchRef.current?.hide(), [], 'exit+=0.25')
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

      // Each real destination has its own mark; everything else — home, the
      // hash-anchored sections, the legal pages — falls back to the house
      // rather than inventing an icon for a page that isn't its own place.
      const direction: TransitionDirection = ROUTE_DIRECTIONS[path] ?? 'home'
      runGlobalWipe(direction, () => finishNavigate(path, opts?.hash))
    },
    [location.pathname, reducedMotion, finishNavigate, runGlobalWipe, lenisRef],
  )

  return (
    <RouteTransitionContext.Provider value={{ goTo }}>
      {children}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[300] overflow-hidden">
        <div
          ref={overlayRef}
          className="absolute inset-y-0 bg-accent"
          style={{ left: `-${PANEL_OVERSCAN}`, width: PANEL_WIDTH, opacity: 0 }}
        />
      </div>
      <TransitionLaunchIcon ref={launchRef} />
    </RouteTransitionContext.Provider>
  )
}
