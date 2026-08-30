import { HERO_NAME_CLASS, HERO_NAME_STYLE } from '@/components/sections/Hero/heroNameStyle'
import { HeroChrome } from '@/components/sections/Hero/HeroChrome'

/**
 * The Work route's own hero — reuses Hero's exact chrome (FoundrLink,
 * tagline, socials, meta block, bottom bar) via `HeroChrome` so nothing but
 * the name changes across the route swap. Arrived at via Hero's own
 * scramble-exit transition rather than the intro sequence, so it renders
 * fully visible immediately (no reveal-in).
 */
export function ExperienceHero() {
  return (
    <HeroChrome
      name={
        <>
          <span className={`${HERO_NAME_CLASS} text-fg`} style={HERO_NAME_STYLE}>
            MY WORK
          </span>
          <span className={`${HERO_NAME_CLASS} text-fg-muted`} style={HERO_NAME_STYLE} aria-hidden="true">
            {' '}
          </span>
        </>
      }
    />
  )
}
