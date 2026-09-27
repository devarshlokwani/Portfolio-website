import { useCallback, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type AuthProvider,
  type User,
} from 'firebase/auth'

import { auth, firebaseEnabled, githubProvider, googleProvider } from '@/lib/firebase'

export type WallProvider = 'google' | 'github'

const PROVIDERS: Record<WallProvider, AuthProvider> = {
  google: googleProvider,
  github: githubProvider,
}

/**
 * Who is signed in, and the two calls to change that.
 *
 * The wall is public to read and signed-in to write. Tying an entry to an
 * account is what makes one signature per person enforceable in the security
 * rules rather than merely asked for in the interface, and it is why the
 * anonymous client id and its cooldown are no longer carrying that job on
 * their own.
 *
 * `pending` starts true and only clears once Firebase has reported the first
 * auth state. Without it the sign-in panel flashes up for the moment before
 * a returning visitor's session is restored, which reads as having been
 * signed out.
 */
export function useWallAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [pending, setPending] = useState(firebaseEnabled)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!auth) return undefined
    return onAuthStateChanged(auth, (next) => {
      setUser(next)
      setPending(false)
    })
  }, [])

  const signIn = useCallback(async (provider: WallProvider) => {
    if (!auth) {
      setError('The wall is not connected yet. Check back shortly.')
      return
    }
    setError(null)
    setBusy(true)
    try {
      await signInWithPopup(auth, PROVIDERS[provider])
    } catch (e) {
      const code = (e as { code?: string })?.code ?? ''
      // A closed popup is the visitor changing their mind, not a fault, and
      // an error message for it would be telling them off for it.
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setError(null)
      } else if (code === 'auth/account-exists-with-different-credential') {
        setError('That email is already signed in with the other provider. Try that one.')
      } else if (code === 'auth/popup-blocked') {
        setError('Your browser blocked the sign-in window. Allow popups and try again.')
      } else {
        setError('Could not sign you in. Try again in a moment.')
      }
    } finally {
      setBusy(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!auth) return
    await firebaseSignOut(auth)
  }, [])

  return { user, pending, busy, error, signIn, signOut, setError }
}
