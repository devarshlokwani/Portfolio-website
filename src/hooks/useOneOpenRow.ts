import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * How long a pointer has to rest on a row before it opens.
 *
 * Short enough not to feel like a wait, long enough that sweeping the
 * pointer down the list on the way somewhere else does not open every row
 * it crosses.
 */
const HOVER_INTENT_MS = 90

/**
 * Grace period before the list closes after the pointer leaves it.
 *
 * Long enough that clipping a corner on the way past, or crossing the gap
 * between a row and the card below it, does not shut the list; short enough
 * that leaving it deliberately reads as immediate.
 */
const CLOSE_MS = 140

/**
 * One row of a hover-expanded list open at a time, owned by the list rather
 * than by each row.
 *
 * A row closing itself on mouseleave is what makes a list like this unusable
 * downwards: leaving one on the way to the row below collapses it, pulls the
 * one below up by the height of the card that just vanished, and leaves the
 * pointer over the gap where it used to be. Here a row only closes because
 * another opened, by which time the one being reached for is already open and
 * a card taller than it was, so the pointer is still inside it.
 *
 * Leaving the list as a whole still closes it. That is one boundary, crossed
 * deliberately, rather than one per row crossed on the way somewhere else.
 */
export function useOneOpenRow() {
  const [openId, setOpenId] = useState<string | null>(null)
  /** The open row as of right now, readable while deciding the next one. */
  const openRef = useRef<string | null>(null)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const commit = useCallback((next: string | null) => {
    openRef.current = next
    setOpenId(next)
  }, [])

  /** Hover or keyboard focus asking for a row, once it has been held. */
  const aim = useCallback(
    (id: string) => {
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => commit(id), HOVER_INTENT_MS)
    },
    [commit],
  )

  /** The pointer left the list: cancel anything pending, then close. */
  const leave = useCallback(() => {
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => commit(null), CLOSE_MS)
  }, [commit])

  /** Tap, for touch, where there is no hover to open with. */
  const toggle = useCallback(
    (id: string) => {
      window.clearTimeout(timerRef.current)
      commit(openRef.current === id ? null : id)
    },
    [commit],
  )

  return { openId, aim, leave, toggle }
}
