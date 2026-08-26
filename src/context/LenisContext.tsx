import { createContext, type RefObject } from 'react'
import type Lenis from 'lenis'

export const LenisContext = createContext<RefObject<Lenis | null> | null>(null)
