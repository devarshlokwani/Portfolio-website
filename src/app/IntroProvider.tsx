import type { ReactNode } from 'react'

import { IntroContext } from '@/context/IntroContext'
import { useIntroGate } from '@/hooks/useIntroGate'

export function IntroProvider({ children }: { children: ReactNode }) {
  const { introComplete, skipped, completeIntro } = useIntroGate()

  return (
    <IntroContext.Provider value={{ introComplete, skipped, completeIntro }}>
      {children}
    </IntroContext.Provider>
  )
}
