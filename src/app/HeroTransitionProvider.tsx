import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react'

/** Returns whether it actually ran — Hero stays mounted (just possibly
 *  scrolled out of view) the whole time the user is on Home, so "registered"
 *  alone can't mean "usable"; the handler itself checks visibility and
 *  declines when its own text isn't actually on screen. */
type HeroExitHandler = (onComplete: () => void) => boolean

interface HeroTransitionContextValue {
  registerHandler: (fn: HeroExitHandler | null) => void
  runHeroExit: (onComplete: () => void) => boolean
}

const HeroTransitionContext = createContext<HeroTransitionContextValue | null>(null)

export function useHeroTransitionRegistry() {
  const ctx = useContext(HeroTransitionContext)
  if (!ctx) throw new Error('useHeroTransitionRegistry must be used within a HeroTransitionProvider')
  return ctx
}

/**
 * A tiny registry so the route-transition system can trigger the Hero
 * section's own race-exit-into-"MY WORK" animation — only usable when Hero
 * is actually on screen (see HeroExitHandler) — without Hero and the router
 * needing to import each other directly.
 */
export function HeroTransitionProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<HeroExitHandler | null>(null)

  const registerHandler = useCallback((fn: HeroExitHandler | null) => {
    handlerRef.current = fn
  }, [])

  const runHeroExit = useCallback((onComplete: () => void) => {
    if (!handlerRef.current) return false
    return handlerRef.current(onComplete)
  }, [])

  return (
    <HeroTransitionContext.Provider value={{ registerHandler, runHeroExit }}>
      {children}
    </HeroTransitionContext.Provider>
  )
}
