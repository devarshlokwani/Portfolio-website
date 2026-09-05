import type Lenis from 'lenis'

// Fixed nav sits on top of the page, so scrolling straight to a section's
// top would tuck its heading behind it, offset upward by roughly the nav's
// height plus breathing room.
const DEFAULT_OFFSET = -100

/**
 * Routes a same-page anchor click through Lenis instead of the browser's
 * native anchor jump, which ignores Lenis's virtual scroll position and
 * snaps instantly. Returns whether it handled the scroll (so callers know
 * whether to preventDefault).
 */
export function smoothScrollToHash(
  lenis: Lenis | null,
  href: string,
  offset = DEFAULT_OFFSET,
  onComplete?: () => void,
) {
  if (!lenis || !href.startsWith('#')) return false
  lenis.scrollTo(href, { offset, duration: 1.1, onComplete })
  return true
}
