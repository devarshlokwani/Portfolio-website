import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { getAuth, GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

export const app = firebaseEnabled ? initializeApp(firebaseConfig) : null

// App Check (reCAPTCHA v3) is a second lock on the wall, behind signing in:
// it stops a script holding a stolen token from writing directly to the
// collection. Requires a site key from the Firebase console
// (App Check -> reCAPTCHA v3) and the site registered there.
if (app && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
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
