import type { CSSProperties } from 'react'

/**
 * Accent, lightened along its own hue rather than blended toward another
 * colour: a two-hue gradient would break the orange/black palette the rest
 * of the site holds to.
 *
 * Shared so the hero's tagline and the sub-footer's headlines pick up the
 * same treatment rather than two definitions drifting apart.
 */
export const ACCENT_GRADIENT: CSSProperties = {
  backgroundImage:
    'linear-gradient(100deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 38%, #fff))',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
}

/** Foundr's own green, the way the hero's Foundr pill already does it. */
export const GREEN_GRADIENT: CSSProperties = {
  backgroundImage: 'linear-gradient(100deg, #3f8f6b, #a9e7c6)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
}

/**
 * The faint top-down sheen on the nav pill and the buttons inside it.
 *
 * It is light catching a raised edge, not a colour: a wash of the theme's
 * own foreground that fades out before halfway down, so the pill reads as
 * having a lit top edge rather than as a grey box with a gradient in it.
 * Deliberately weak. At any real strength it stops looking like light and
 * starts looking like a second surface colour.
 */
export const SURFACE_SHEEN: CSSProperties = {
  backgroundImage:
    'linear-gradient(180deg, color-mix(in srgb, var(--color-fg) 9%, transparent), transparent 58%)',
}
