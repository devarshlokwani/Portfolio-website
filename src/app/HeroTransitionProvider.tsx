import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react'

type HeroExitHandler = (onComplete: () => void) => void

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
 * section's own race-exit-into-"EXPERIENCE" animation (only relevant when
 * Hero happens to be mounted, i.e. navigating there from Home) without Hero
 * and the router needing to import each other directly.
 */
export function HeroTransitionProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<HeroExitHandler | null>(null)

  const registerHandler = useCallback((fn: HeroExitHandler | null) => {
    handlerRef.current = fn
  }, [])

  const runHeroExit = useCallback((onComplete: () => void) => {
    if (!handlerRef.current) return false
    handlerRef.current(onComplete)
    return true
  }, [])

  return (
    <HeroTransitionContext.Provider value={{ registerHandler, runHeroExit }}>
      {children}
    </HeroTransitionContext.Provider>
  )
}
