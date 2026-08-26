import { useContext } from 'react'

import { LenisContext } from '@/context/LenisContext'

/** Access the shared Lenis instance created by LenisProvider (may be null before mount, or if reduced-motion disabled it). */
export function useLenisInstance() {
  const ctx = useContext(LenisContext)
  if (!ctx) throw new Error('useLenisInstance must be used within a LenisProvider')
  return ctx
}
