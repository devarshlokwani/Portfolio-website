import { useContext } from 'react'

import { IntroContext } from '@/context/IntroContext'

export function useIntro() {
  const ctx = useContext(IntroContext)
  if (!ctx) throw new Error('useIntro must be used within an IntroProvider')
  return ctx
}
