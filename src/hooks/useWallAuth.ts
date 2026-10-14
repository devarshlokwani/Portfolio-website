import { useCallback, useEffect, useState } from 'react'
import {
  getRedirectResult,
  onAuthStateChanged,
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
  if (code === 'auth/account-exists-with-different-credential') {
    return 'That email is already signed in with the other provider. Try that one.'
  }
  // The visitor backing out of the provider's page is a decision, not a
  // fault, and an error for it would be telling them off for changing their
  // mind.
  if (code === 'auth/user-cancelled' || code === 'auth/cancelled-popup-request') {
    return null
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
 * Signing in redirects the page rather than opening a second window. A popup
 * puts the provider in a bare browser frame with its own address bar, which
 * reads as something that arrived from outside the site, and it is the thing
 * browsers and extensions block most readily. Redirecting hands the whole
 * page over and brings it back, so the only chrome on screen is the one the
 * visitor already trusts.
 *
 * The cost is that the result arrives on the next page load rather than from
 * the call, which is what `getRedirectResult` is reading below: it is the
 * only place a failed sign-in can still be reported, since by then the call
 * that started it is long gone.
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

  // Picks up a sign-in that completed while the page was away. Resolves to
  // null on an ordinary load, so this costs nothing when nobody signed in.
  useEffect(() => {
    if (!auth) return
    getRedirectResult(auth).catch((e: unknown) => {
      const code = (e as { code?: string })?.code ?? ''
      setError(messageFor(code))
    })
  }, [])

  /**
   * Lets the buttons go again when the visitor comes back without signing in.
   *
   * Handing the page to the provider means the `busy` that disabled the
   * buttons is never cleared by the call that set it: the navigation happens
   * first. Pressing back then restores this page from the browser's
   * back/forward cache with that state frozen exactly as it was, buttons
   * still disabled, and no amount of clicking brings them round.
   *
   * `pageshow` is what distinguishes a restore from a fresh load, and fires
   * for both, so clearing here covers the case without needing to know which
   * happened. On a fresh load it is setting false over false.
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
    try {
      // Navigates away. Nothing after this runs on a successful sign-in, so
      // `busy` is only ever cleared when the redirect itself failed to start.
      await signInWithRedirect(auth, PROVIDERS[provider])
    } catch (e) {
      const code = (e as { code?: string })?.code ?? ''
      setError(messageFor(code))
      setBusy(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!auth) return
    await firebaseSignOut(auth)
  }, [])

  return { user, pending, busy, error, signIn, signOut, setError }
}
