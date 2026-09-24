import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { collection, limit, onSnapshot, orderBy, query, type Timestamp } from 'firebase/firestore'

import type { WallEntry } from '@/components/sections/SignTheWall/types'
import { db, firebaseEnabled } from '@/lib/firebase'
import { Flip } from '@/lib/gsap'

/** The empty and unconfigured states, sized like the wall they stand in for. */
function EmptyWall({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-dashed border-border p-8">
      <p className="max-w-xs text-center font-mono text-sm text-fg-subtle">{children}</p>
    </div>
  )
}

/** Small deterministic hash so each card gets a stable, graffiti-wall-style tilt. */
function tiltFor(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 1000
  return (hash / 1000) * 6 - 3 // -3deg .. 3deg
}

export function WallEntryList() {
  const [entries, setEntries] = useState<WallEntry[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const flipStateRef = useRef<Flip.FlipState | null>(null)
  const hasLoadedOnce = useRef(false)

  useEffect(() => {
    if (!firebaseEnabled || !db) return

    const q = query(collection(db, 'wallEntries'), orderBy('createdAt', 'desc'), limit(50))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (hasLoadedOnce.current && containerRef.current) {
        flipStateRef.current = Flip.getState(containerRef.current.children)
      }
      hasLoadedOnce.current = true

      setEntries(
        snapshot.docs.map((doc) => {
          const data = doc.data() as { name: string; message: string; createdAt: Timestamp | null }
          return {
            id: doc.id,
            name: data.name,
            message: data.message,
            createdAt: data.createdAt?.toMillis() ?? null,
          }
        }),
      )
    })

    return unsubscribe
  }, [])

  useLayoutEffect(() => {
    if (!flipStateRef.current) return
    Flip.from(flipStateRef.current, { duration: 0.6, ease: 'power2.out', stagger: 0.03, scale: true })
    flipStateRef.current = null
  }, [entries])

  // Both of these fill the column rather than leaving one line of text in a
  // space sized to hold a wall of cards, which read as something that had
  // failed to load rather than as a wall with nothing on it yet.
  if (!firebaseEnabled) {
    return <EmptyWall>The wall is not connected yet. Check back shortly.</EmptyWall>
  }

  if (entries.length === 0) {
    return <EmptyWall>Nothing up here yet. Yours would be the first.</EmptyWall>
  }

  return (
    <div ref={containerRef} className="flex flex-wrap gap-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          style={{ transform: `rotate(${tiltFor(entry.id)}deg)` }}
          className="w-56 rounded-lg border border-border bg-surface p-4 shadow-md"
        >
          <p className="text-sm text-fg">{entry.message}</p>
          <p className="mt-3 font-mono text-xs text-fg-subtle">{entry.name}</p>
        </div>
      ))}
    </div>
  )
}
