import type { ReactNode } from 'react'

import { IntroProvider } from '@/app/IntroProvider'
import { LenisProvider } from '@/app/LenisProvider'
import { ThemeProvider } from '@/app/ThemeProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LenisProvider>
        <IntroProvider>{children}</IntroProvider>
      </LenisProvider>
    </ThemeProvider>
  )
}
