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

/**
 * The faint diagonal lift that keeps a card from reading as a flat slab.
 *
 * Light falling across the panel from the top left, fading out well before
 * halfway: enough to give the surface a direction, not enough to be seen as
 * a gradient in its own right. Both stops are opaque, so a card wearing this
 * still hides whatever is layered behind it, which is what the About cards
 * need of their cogs.
 *
 * Taken as a function of the base colour rather than a fixed pair of colours
 * because the cards that use it do not share one: the sub-footer's sit on
 * the page colour and About's on the lifted surface. Same treatment, each
 * measured from its own ground.
 *
 * The lift is toward the theme's foreground rather than white, which is what
 * makes it survive the light theme. Mixing white into a card that is already
 * white changes nothing, so the treatment simply vanished there; mixing in
 * the foreground lightens a dark card and shades a light one, which is the
 * same idea either way round.
 */
export function cardSheen(base: string, lift = 10): CSSProperties {
  return {
    backgroundImage: `linear-gradient(158deg, color-mix(in srgb, ${base} ${100 - lift}%, var(--color-fg)), ${base} 62%)`,
  }
}
