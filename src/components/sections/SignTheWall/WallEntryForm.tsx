import { useEffect, useRef, useState, type FormEvent } from 'react'
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { LuGithub, LuLogOut, LuPenLine, LuTrash2 } from 'react-icons/lu'
import { FcGoogle } from 'react-icons/fc'

import { WallAvatar } from '@/components/sections/SignTheWall/WallAvatar'
import { CornerCog } from '@/components/ui/CornerCog'
import { CtaLaunchButton } from '@/components/ui/CtaLaunchButton'
import { useWallAuth } from '@/hooks/useWallAuth'
import { db, firebaseEnabled } from '@/lib/firebase'
import { containsBlockedWord } from '@/lib/moderation'

const MESSAGE_MAX = 200

type Status = 'idle' | 'submitting' | 'success' | 'error'

/**
 * The wall's write side.
 *
 * Signed out it is a sign-in panel; signed in it is the form, with the
 * account you are about to sign as shown above it. The entry is written to a
 * document whose id is the account's own uid, so signing again edits the
 * signature already on the wall rather than adding a second one. That is
 * what stops one person filling the wall, and the security rules enforce the
 * same thing rather than trusting this component to.
 */
export function WallEntryForm() {
  const { user, pending, busy, error: authError, signIn, signOut } = useWallAuth()
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  /**
   * Both of these carry the account they belong to.
   *
   * Signing out, or signing in as someone else, then reads as an empty box
   * and an unsigned wall on its own, rather than needing an effect to reach
   * in and blank them. A reading taken for one account simply stops counting
   * once a different one is in the chair.
   */
  const [draft, setDraft] = useState<{ uid: string | null; text: string }>({
    uid: null,
    text: '',
  })
  const [loaded, setLoaded] = useState<{ uid: string | null; existing: boolean }>({
    uid: null,
    existing: false,
  })

  const uid = user?.uid ?? null
  const message = draft.uid === uid ? draft.text : ''
  const existing = loaded.uid === uid && loaded.existing
  const loading = Boolean(uid) && loaded.uid !== uid

  // A returning signer sees what they wrote last time, so the button reads as
  // editing something rather than adding to it.
  useEffect(() => {
    if (!user || !db) return undefined
    let cancelled = false

    getDoc(doc(db, 'wallEntries', user.uid))
      .then((snap) => {
        if (cancelled) return
        if (snap.exists()) {
          setDraft({ uid: user.uid, text: (snap.data().message as string) ?? '' })
        }
        setLoaded({ uid: user.uid, existing: snap.exists() })
      })
      .catch(() => {
        if (!cancelled) setLoaded({ uid: user.uid, existing: false })
      })

    return () => {
      cancelled = true
    }
  }, [user])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmed = message.trim()
    const name = user?.displayName?.trim() || 'Anonymous'

    if (!trimmed) {
      setError('Write something first.')
      return
    }
    if (containsBlockedWord(trimmed) || containsBlockedWord(name)) {
      setError("Let's keep it clean. Try rewording that.")
      return
    }
    if (!firebaseEnabled || !db || !user) {
      setError('The wall is not connected yet. Check back shortly.')
      return
    }

    setStatus('submitting')
    try {
      // The uid is the document id, so this replaces rather than appends.
      // Merged rather than overwritten, because anything set on the document
      // from the console, `pinned` above all, would otherwise be dropped the
      // moment its author came back and reworded their message.
      await setDoc(
        doc(db, 'wallEntries', user.uid),
        {
          uid: user.uid,
          name: name.slice(0, 40),
          message: trimmed.slice(0, MESSAGE_MAX),
          provider: user.providerData[0]?.providerId ?? 'google.com',
          createdAt: serverTimestamp(),
        },
        { merge: true },
      )
      setLoaded({ uid: user.uid, existing: true })
      setStatus('success')
    } catch {
      setStatus('error')
      setError('Something went wrong. Try again in a moment.')
    }
  }

  const onRemove = async () => {
    if (!db || !user) return
    setError(null)
    setStatus('submitting')
    try {
      await deleteDoc(doc(db, 'wallEntries', user.uid))
      setDraft({ uid: user.uid, text: '' })
      setLoaded({ uid: user.uid, existing: false })
      setStatus('idle')
    } catch {
      setStatus('error')
      setError('Could not remove it. Try again in a moment.')
    }
  }

  if (pending) {
    return <div className="h-48 animate-pulse rounded-2xl border border-border bg-surface/40" />
  }

  if (!user) {
    return (
      <div className="relative">
        {/* The same half-buried gears the About cards and the sub-footer
            wear, on the diagonal here so one card still reads as part of the
            mechanism running behind the rest of the site. Siblings painted
            before the card, so its own opaque surface covers the buried half
            and only the teeth past the edge show.

            Held a quarter in from the top and bottom rather than on the
            corners: an absolutely positioned layer paints above the in-flow
            copy around it, and on the corners the topmost teeth reached up
            into the paragraph above the card. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <CornerCog
            placement="left"
            anchor="left-0 top-1/4 -translate-x-1/2 -translate-y-1/2"
            className="h-40 w-40 lg:h-44 lg:w-44"
          />
          <CornerCog
            placement="right"
            anchor="right-0 bottom-1/4 translate-x-1/2 translate-y-1/2"
            className="h-40 w-40 lg:h-44 lg:w-44"
          />
        </div>

      <div className="relative rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-fg-muted">
          Sign in to leave your mark. Your display name is all that is read from the account, and
          one signature is kept per person, so you can come back and change or remove yours.
        </p>

        <div className="mx-auto mt-7 flex max-w-xs flex-col gap-3">
          <button
            type="button"
            onClick={() => signIn('google')}
            disabled={busy}
            data-cursor-hover
            className="inline-flex items-center justify-center gap-3 rounded-full bg-fg px-5 py-3 text-sm font-semibold text-bg transition-[transform,translate,rotate,scale] hover:-translate-y-0.5 disabled:opacity-50"
          >
            <FcGoogle className="h-4 w-4" aria-hidden="true" />
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => signIn('github')}
            disabled={busy}
            data-cursor-hover
            className="inline-flex items-center justify-center gap-3 rounded-full border border-border px-5 py-3 text-sm font-semibold text-fg transition-colors hover:border-fg-subtle disabled:opacity-50"
          >
            <LuGithub className="h-4 w-4" aria-hidden="true" />
            Continue with GitHub
          </button>
        </div>

        <p role="status" className="mt-6 font-mono text-xs text-fg-subtle">
          {authError ? (
            <span className="text-accent">{authError}</span>
          ) : (
            <>
              By signing you agree to the{' '}
              <a href="/terms" className="underline underline-offset-4 hover:text-fg">
                terms
              </a>
              .
            </>
          )}
        </p>
      </div>
      </div>
    )
  }

  const name = user.displayName?.trim() || 'Anonymous'

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-3">
        <span className="flex min-w-0 items-center gap-3">
          <WallAvatar name={name} seed={user.uid} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-fg">{name}</span>
            <span className="block font-mono text-xs text-fg-subtle">Signing as</span>
          </span>
        </span>
        <button
          type="button"
          onClick={signOut}
          data-cursor-hover
          aria-label="Sign out"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-mono text-xs text-fg-subtle transition-colors hover:border-fg-subtle hover:text-fg"
        >
          <LuLogOut className="h-3 w-3" aria-hidden="true" />
          Sign out
        </button>
      </div>

      <textarea
        value={message}
        onChange={(e) => setDraft({ uid, text: e.target.value })}
        maxLength={MESSAGE_MAX}
        rows={4}
        disabled={loading}
        placeholder="What did you think?"
        className="resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-fg disabled:opacity-50"
      />

      <div className="flex items-center justify-between gap-4">
        <p role="status" className="font-mono text-xs text-fg-subtle">
          {error ? (
            <span className="text-accent">{error}</span>
          ) : status === 'success' ? (
            'Up on the wall. Thank you.'
          ) : (
            `${message.length}/${MESSAGE_MAX}`
          )}
        </p>

        {/* Only once there is something to remove. Someone who has signed
            should be able to take it down again without having to ask. */}
        {existing && (
          <button
            type="button"
            onClick={onRemove}
            disabled={status === 'submitting'}
            data-cursor-hover
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 font-mono text-xs text-fg-subtle transition-colors hover:text-accent disabled:opacity-50"
          >
            <LuTrash2 className="h-3 w-3" aria-hidden="true" />
            Remove
          </button>
        )}
        <CtaLaunchButton
          label={
            status === 'submitting' ? 'Signing...' : existing ? 'Update signature' : 'Sign the wall'
          }
          icon={LuPenLine}
          disabled={status === 'submitting' || loading}
          onLaunch={() => formRef.current?.requestSubmit()}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-[transform,translate,rotate,scale] hover:-translate-y-0.5 disabled:opacity-50"
        />
      </div>
    </form>
  )
}
