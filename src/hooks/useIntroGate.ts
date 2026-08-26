import { useCallback, useEffect, useState } from 'react'

import { useLenisInstance } from '@/hooks/useLenisInstance'

const SESSION_KEY = 'introSeen'

function readSkipped(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Owns the intro loader's completion state: whether it should play at all
 * (skipped on repeat visits within the session), and locks page scroll
 * (both native overflow and the shared Lenis instance) until it's done.
 */
export function useIntroGate() {
  const [skipped] = useState(readSkipped)
  const [introComplete, setIntroComplete] = useState(skipped)
  const lenisRef = useLenisInstance()

  useEffect(() => {
    if (introComplete) return

    document.body.style.overflow = 'hidden'
    lenisRef.current?.stop()

    return () => {
      document.body.style.overflow = ''
    }
  }, [introComplete, lenisRef])

  const completeIntro = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      // sessionStorage unavailable — intro will simply replay next load, which is harmless.
    }
    document.body.style.overflow = ''
    lenisRef.current?.start()
    setIntroComplete(true)
  }, [lenisRef])

  return { introComplete, skipped, completeIntro }
}
