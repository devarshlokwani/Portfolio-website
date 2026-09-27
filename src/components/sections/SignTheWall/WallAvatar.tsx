/**
 * A visitor's initials on a colour picked from their own id.
 *
 * Deliberately not the avatar Google or GitHub hands back with the account.
 * Those live on their CDNs, so showing them would put a third-party request
 * on this page for every signature on the wall, and hand each visitor's IP
 * to Google or GitHub simply for reading it. The privacy policy states that
 * images here are served from this domain and that reading a page announces
 * your visit to nobody, and that would stop being true.
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
  className = 'h-10 w-10 text-sm',
}: {
  name: string
  /** Stable per person. The account id where there is one, else the name. */
  seed: string
  className?: string
}) {
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
