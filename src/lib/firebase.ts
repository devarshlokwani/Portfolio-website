import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { getAuth, GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

/**
 * Trims the value a host actually stored.
 *
 * These arrive from a dashboard where a pasted value can carry a trailing
 * newline or a leading space that nothing in the interface shows you. One
 * newline on the end of `authDomain` is enough to break sign-in in a way
 * that looks like anything but whitespace: the domain stops matching the
 * page's host, so the same-origin check silently picks the wrong flow, and
 * the URL Firebase builds from it is not a real host, so the error that
 * surfaces says nothing about where it came from.
 */
const env = (value: string | undefined) => value?.trim() || undefined

const firebaseConfig = {
  apiKey: env(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: env(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: env(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: env(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: env(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: env(import.meta.env.VITE_FIREBASE_APP_ID),
}

/**
 * Every value sign-in needs, not just the two that prove a project exists.
 *
 * `authDomain` was missing from this check once, so a build without it sailed
 * past as connected and failed later at the click, where the cause was four
 * steps removed from the symptom.
 */
export const firebaseEnabled = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain,
)

export const app = firebaseEnabled ? initializeApp(firebaseConfig) : null

// App Check (reCAPTCHA v3) is a second lock on the wall, behind signing in:
// it stops a script holding a stolen token from writing directly to the
// collection. Requires a site key from the Firebase console
// (App Check -> reCAPTCHA v3) and the site registered there.
const recaptchaSiteKey = env(import.meta.env.VITE_RECAPTCHA_SITE_KEY)

if (app && recaptchaSiteKey) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  })
}

export const db = app ? getFirestore(app) : null

export const auth = app ? getAuth(app) : null

/**
 * The two ways in.
 *
 * Google and GitHub because between them they cover almost everyone who
 * would be reading a software portfolio, and neither asks the visitor to
 * invent a password for a guestbook. Nothing but the display name and
 * avatar is read from either.
 */
export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider()
