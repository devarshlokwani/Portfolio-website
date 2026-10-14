import { useState } from 'react'

/**
 * A signer's profile picture, falling back to their initials.
 *
 * The picture is the one their provider hands back, served from Google's or
 * GitHub's CDN. That is a third-party request per signature on the wall, and
 * it hands those two a visitor's IP address for reading the page: the
 * privacy policy says so plainly rather than the site pretending otherwise.
 * It is the trade for a wall of faces instead of a wall of monograms.
 *
 * Initials remain the fallback, and not only for accounts with no picture.
 * Provider avatar URLs expire, get revoked, and fail to load behind strict
 * blockers, so a broken image is a normal state rather than an edge case,
 * and reaching it should look deliberate.
 *
 * The colour is derived rather than random so the same person keeps the same
 * one on every visit and across reloads.
 */

/** Picked to sit clearly against both themes' card surfaces. */
const COLOURS = [
  '#e0603c',
  '#c9803a',
  '#8a9a3f',
  '#3f8f6b',
  '#3c8fa8',
  '#5a6fb8',
  '#8a5fae',
  '#b8517e',
]

function hash(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) % 100000
  return h
}

/** First letter of the first two words, so "Zobia Masood" reads as ZM. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function WallAvatar({
  name,
  seed,
  photoURL = null,
  className = 'h-10 w-10 text-sm',
}: {
  name: string
  /** Stable per person. The account id where there is one, else the name. */
  seed: string
  /** The provider's picture, if the account had one. */
  photoURL?: string | null
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (photoURL && !failed) {
    return (
      <img
        src={photoURL}
        alt=""
        aria-hidden="true"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`inline-block shrink-0 rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      style={{ backgroundColor: COLOURS[hash(seed) % COLOURS.length] }}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-mono font-semibold text-white ${className}`}
    >
      {initialsOf(name)}
    </span>
  )
}
