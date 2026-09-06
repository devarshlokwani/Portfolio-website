import { createContext, useContext } from 'react'

export interface GoToOptions {
  /** scroll to this hash on the destination page once it's mounted */
  hash?: string
}

export interface RouteTransitionContextValue {
  goTo: (path: string, opts?: GoToOptions) => void
}

export const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null)

/**
 * The context and its hook live apart from the provider component.
 *
 * A module that exports both components and other values cannot be hot
 * reloaded on its own: React Refresh has no way to preserve the non-component
 * exports, so it falls back to reloading the whole page. Splitting the hook
 * out means editing the provider's animation code refreshes in place, which
 * is exactly the code that gets iterated on.
 */
export function useRouteTransition() {
  const ctx = useContext(RouteTransitionContext)
  if (!ctx) throw new Error('useRouteTransition must be used within a RouteTransitionProvider')
  return ctx
}
