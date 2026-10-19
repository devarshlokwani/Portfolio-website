import { useCallback, useEffect, useState } from 'react'
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
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

/** Turns a Firebase auth error code into something worth reading. */
function messageFor(code: string): string | null {
  // Closing the window is the visitor changing their mind, not a fault, and
  // an error for it would be telling them off for it.
  if (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    code === 'auth/user-cancelled'
  ) {
    return null
  }
  if (code === 'auth/account-exists-with-different-credential') {
    return 'That email is already signed in with the other provider. Try that one.'
  }
  if (code === 'auth/popup-blocked') {
    return 'Your browser blocked the sign-in window. Allow popups and try again.'
  }
  return 'Could not sign you in. Try again in a moment.'
}

/**
 * Who is signed in, and the two calls to change that.
 *
 * The wall is public to read and signed-in to write. Tying an entry to an
 * account is what makes one signature per person enforceable in the security
 * rules rather than merely asked for in the interface.
 *
 * Sign-in hands over the whole page where it can, and opens a window where
 * it cannot. Which one is possible comes down to a single thing: whether the
 * auth handler is served from this same origin.
 *
 * Redirecting is the better experience, the provider filling the tab rather
 * than arriving in a bare frame with its own address bar. But mid-redirect
 * Firebase leaves its state on the `authDomain`, and if that is a different
 * origin to the page, the state is third-party storage. Browsers that block
 * it, Edge and Safari among them, send the visitor back signed out with
 * nothing to show for the trip and no error to explain it. Production
 * proxies `/__/auth/*` through this domain precisely so the two match.
 *
 * Nothing here needs to know which environment it is in. It compares the
 * configured `authDomain` against the page's own host and picks the flow
 * that can actually complete, so a deployment where the proxy is missing
 * degrades to a popup instead of failing silently.
 *
 * `pending` starts true and only clears once Firebase has reported the first
 * auth state. Without it the sign-in panel flashes up for the moment before a
 * returning visitor's session is restored, which reads as having been signed
 * out.
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

  // Picks up a sign-in that finished while the page was away, which is the
  // only place a failed redirect can still be reported: the call that began
  // it is long gone by then. Resolves to null on an ordinary load.
  useEffect(() => {
    if (!auth) return
    getRedirectResult(auth).catch((e: unknown) => {
      const code = (e as { code?: string })?.code ?? ''
      console.error('[wall] returning from sign-in failed:', code || e)
      setError(messageFor(code))
    })
  }, [])

  /**
   * Lets the buttons go again when the page comes back from the cache.
   *
   * Pressing back onto a page the browser kept in its back/forward cache
   * restores its state exactly as it was, which includes a `busy` that was
   * set on the way out and never cleared. `pageshow` fires on that restore
   * as well as on a fresh load, so clearing here covers it either way: on a
   * fresh load it is setting false over false.
   */
  useEffect(() => {
    const reset = () => setBusy(false)
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  }, [])

  const signIn = useCallback(async (provider: WallProvider) => {
    if (!auth) {
      setError('The wall is not connected yet. Check back shortly.')
      return
    }
    setError(null)
    setBusy(true)

    // Same host means the handler is ours to serve, so the redirect's state
    // is first-party and survives. Anything else, localhost included, has to
    // use a window.
    const sameOrigin = auth.config.authDomain === window.location.hostname

    try {
      if (sameOrigin) {
        // Navigates away. Nothing after this runs on success, and the result
        // is picked up by getRedirectResult on the way back in.
        await signInWithRedirect(auth, PROVIDERS[provider])
        return
      }
      await signInWithPopup(auth, PROVIDERS[provider])
    } catch (e) {
      const code = (e as { code?: string })?.code ?? ''
      // The friendly sentence below is for the visitor. The code is for
      // whoever has to work out why, and without it a configuration fault
      // and a declined consent screen look identical from the outside.
      console.error('[wall] sign-in failed:', code || e)
      setError(messageFor(code))
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
