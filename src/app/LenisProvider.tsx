import type { ReactNode } from 'react'

import { LenisContext } from '@/context/LenisContext'
import { useLenis } from '@/hooks/useLenis'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function LenisProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion()
  const lenisRef = useLenis(!reducedMotion)

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
}
