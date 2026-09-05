import { createContext } from 'react'

export interface IntroContextValue {
  /** true once the loader has finished (or was skipped for a repeat visit this session) */
  introComplete: boolean
  /** true if the loader was skipped outright (already seen this session), no exit animation to wait for */
  skipped: boolean
  /** call when the loader's own timeline/exit animation finishes */
  completeIntro: () => void
}

export const IntroContext = createContext<IntroContextValue | null>(null)
