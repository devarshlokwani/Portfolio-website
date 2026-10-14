import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore'
import { LuCheck, LuGithub, LuPin, LuPinOff, LuQuote, LuTrash2, LuX } from 'react-icons/lu'
import { FcGoogle } from 'react-icons/fc'

import type { WallEntry } from '@/components/sections/SignTheWall/types'
import { WallAvatar } from '@/components/sections/SignTheWall/WallAvatar'
import { useWallAuth } from '@/hooks/useWallAuth'
import { isAdminEmail } from '@/lib/admin'
import { db, firebaseEnabled } from '@/lib/firebase'
import { Flip } from '@/lib/gsap'

/** The empty and unconfigured states, sized like the wall they stand in for. */
function EmptyWall({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-border p-8">
      <p className="max-w-xs text-center font-mono text-sm text-fg-subtle">{children}</p>
    </div>
  )
}

/**
 * How they signed in, rather than a blue tick.
 *
 * The reference this is built from puts a verification badge beside the name,
 * which would be claiming something about the person that this site has no
 * way to know. Naming the provider says the one thing that is actually true
 * and is just as quick to read.
 */
function ProviderMark({ provider }: { provider: string | null }) {
  if (provider === 'github.com') {
    return <LuGithub className="h-3.5 w-3.5 shrink-0 text-fg-subtle" aria-label="Signed in with GitHub" />
  }
  if (provider === 'google.com') {
    return <FcGoogle className="h-3.5 w-3.5 shrink-0" aria-label="Signed in with Google" />
  }
  return null
}

/** "Sep 11", in the visitor's own locale. */
function formatDate(ms: number | null): string {
  if (!ms) return ''
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** One of the small controls the review row is built from. */
function ReviewButton({
  onClick,
  busy,
  label,
  tone = 'plain',
  children,
}: {
  onClick: () => void
  busy: boolean
  label: string
  tone?: 'plain' | 'accent'
  children: ReactNode
}) {
  const palette =
    tone === 'accent'
      ? 'border-accent bg-accent text-accent-fg hover:brightness-110'
      : 'border-border text-fg-muted hover:border-fg-subtle hover:text-fg'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={label}
      title={label}
      data-cursor-hover
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 font-mono text-[0.65rem] uppercase tracking-[0.15em] transition-colors disabled:opacity-40 ${palette}`}
    >
      {children}
    </button>
  )
}

export function WallEntryList() {
  const { user } = useWallAuth()
  const isAdmin = isAdminEmail(user?.email)

  const [entries, setEntries] = useState<WallEntry[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const flipStateRef = useRef<Flip.FlipState | null>(null)
  const hasLoadedOnce = useRef(false)

  useEffect(() => {
    if (!firebaseEnabled || !db) return undefined

    // Two queries, because the rules are evaluated per document and a list
    // that would return one the reader cannot see fails as a whole. The
    // public asks for approved entries only; the admin asks for everything,
    // which is exactly what they are allowed to read.
    const base = collection(db, 'wallEntries')
    const q = isAdmin
      ? query(base, orderBy('createdAt', 'desc'), limit(50))
      : query(base, where('approved', '==', true), orderBy('createdAt', 'desc'), limit(50))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (hasLoadedOnce.current && containerRef.current) {
        flipStateRef.current = Flip.getState(containerRef.current.children)
      }
      hasLoadedOnce.current = true

      const next: WallEntry[] = snapshot.docs.map((d) => {
        const data = d.data() as {
          name: string
          message: string
          provider?: string
          photoURL?: string | null
          pinned?: boolean
          approved?: boolean
          createdAt: Timestamp | null
        }
        return {
          id: d.id,
          name: data.name,
          message: data.message,
          provider: data.provider ?? null,
          photoURL: data.photoURL ?? null,
          pinned: data.pinned === true,
          approved: data.approved === true,
          createdAt: data.createdAt?.toMillis() ?? null,
        }
      })

      // Waiting first for the admin, since to them the list is a review
      // queue, then pinned, then newest. Sorted here rather than in the query
      // because Firestore would want an index per combination, and fifty
      // entries is nothing to order in the browser.
      next.sort((a, b) => {
        if (isAdmin && a.approved !== b.approved) return Number(a.approved) - Number(b.approved)
        return Number(b.pinned) - Number(a.pinned)
      })
      setEntries(next)
    })

    return unsubscribe
  }, [isAdmin])

  useLayoutEffect(() => {
    if (!flipStateRef.current) return
    Flip.from(flipStateRef.current, { duration: 0.6, ease: 'power2.out', stagger: 0.03, scale: true })
    flipStateRef.current = null
  }, [entries])

  const setFlag = async (id: string, patch: { approved?: boolean; pinned?: boolean }) => {
    if (!db) return
    setBusyId(id)
    try {
      await updateDoc(doc(db, 'wallEntries', id), patch)
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id: string) => {
    if (!db) return
    setBusyId(id)
    try {
      await deleteDoc(doc(db, 'wallEntries', id))
    } finally {
      setBusyId(null)
    }
  }

  // Both of these fill the column rather than leaving one line of text in a
  // space sized to hold a wall of cards, which read as something that had
  // failed to load rather than as a wall with nothing on it yet.
  if (!firebaseEnabled) {
    return <EmptyWall>The wall is not connected yet. Check back shortly.</EmptyWall>
  }

  if (entries.length === 0) {
    return <EmptyWall>Nothing up here yet. Yours would be the first.</EmptyWall>
  }

  const waiting = entries.filter((entry) => !entry.approved).length

  return (
    <div className="flex flex-col gap-4">
      {isAdmin && waiting > 0 && (
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
          {waiting} waiting for review
        </p>
      )}

      <div ref={containerRef} className="grid gap-4 sm:grid-cols-2">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className={`relative overflow-hidden rounded-2xl border bg-surface p-5 transition-colors ${
              !entry.approved
                ? 'border-dashed border-accent/50'
                : entry.pinned
                  ? 'border-accent/60'
                  : 'border-border'
            }`}
          >
            {/* Oversized and half off the corner, so it reads as watermark
                rather than as punctuation competing with the message. */}
            <LuQuote
              aria-hidden="true"
              className="pointer-events-none absolute -right-2 -top-1 h-16 w-16 text-fg opacity-[0.07]"
            />

            <header className="flex items-center gap-3">
              <WallAvatar
                name={entry.name}
                seed={entry.id}
                photoURL={entry.photoURL}
                className="h-10 w-10 text-xs"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-semibold text-fg">{entry.name}</p>
                  <ProviderMark provider={entry.provider} />
                </div>
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-fg-subtle">
                  {formatDate(entry.createdAt)}
                </p>
              </div>
            </header>

            <p className="relative mt-4 text-sm leading-relaxed text-fg-muted">{entry.message}</p>

            {/* The name again, in the signature face the footer uses for
                Devarsh's own. A guestbook entry is a signature, and drawing it
                as one is the whole conceit of the page. */}
            <p className="mt-4 font-signature text-2xl leading-none text-fg-subtle/70">
              {entry.name}
            </p>

            {entry.pinned && entry.approved && (
              <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
                <LuPin className="h-3 w-3" aria-hidden="true" />
                Pinned
              </p>
            )}

            {isAdmin && (
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                {entry.approved ? (
                  <>
                    <ReviewButton
                      onClick={() => setFlag(entry.id, { approved: false })}
                      busy={busyId === entry.id}
                      label="Take this signature back off the wall"
                    >
                      <LuX className="h-3.5 w-3.5" aria-hidden="true" />
                      Hide
                    </ReviewButton>
                    <ReviewButton
                      onClick={() => setFlag(entry.id, { pinned: !entry.pinned })}
                      busy={busyId === entry.id}
                      label={entry.pinned ? 'Unpin this signature' : 'Pin this signature to the top'}
                    >
                      {entry.pinned ? (
                        <LuPinOff className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <LuPin className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {entry.pinned ? 'Unpin' : 'Pin'}
                    </ReviewButton>
                  </>
                ) : (
                  <>
                    <span className="mr-auto font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
                      Waiting
                    </span>
                    <ReviewButton
                      onClick={() => setFlag(entry.id, { approved: true })}
                      busy={busyId === entry.id}
                      tone="accent"
                      label="Approve this signature for the wall"
                    >
                      <LuCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      Approve
                    </ReviewButton>
                  </>
                )}
                <ReviewButton
                  onClick={() => remove(entry.id)}
                  busy={busyId === entry.id}
                  label="Delete this signature permanently"
                >
                  <LuTrash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete
                </ReviewButton>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
