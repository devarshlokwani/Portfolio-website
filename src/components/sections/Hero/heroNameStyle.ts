import type { CSSProperties } from 'react'

/**
 * Shared typography for the Hero name (DEVARSH / LOKWANI / the "MY WORK"
 * it scrambles into) and the Experience page's own title — kept in one
 * place so "MY WORK" reads at the identical size on both sides of the
 * route swap instead of two independently-tuned values silently drifting
 * apart. `color` is intentionally left out — each usage supplies its own.
 */
export const HERO_NAME_CLASS = 'font-display font-extrabold uppercase'

export const HERO_NAME_STYLE: CSSProperties = {
  fontSize: 'clamp(3.5rem, 16vw, 230px)',
  letterSpacing: '-0.06em',
  // A row built from many small `inline-block` character cells (see
  // ReloadText) naturally computes a taller line-box than one continuous
  // run of plain text at the same font-size/line-height — clamping the row
  // itself to a fixed height (rather than trusting line-height alone) keeps
  // every row's rendered height identical regardless of whether it's built
  // from plain text or per-character cells, which is what let the "MY
  // WORK" title on the Work page and the FoundrLink/tagline/socials below
  // Hero's own name drift apart in Y position.
  height: '0.9em',
  lineHeight: '0.9em',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
