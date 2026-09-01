import { useState } from 'react'

import { HeroChrome } from '@/components/sections/Hero/HeroChrome'
import { WarpText } from '@/components/sections/Hero/WarpText'
import { useGlyphReload } from '@/hooks/useGlyphReload'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useScrambleReveal } from '@/hooks/useScrambleReveal'
import { useTheme } from '@/hooks/useTheme'

// Mirrors --color-fg in theme.css — WarpText rasterizes onto a canvas, so
// it needs a resolved color value rather than a CSS var.
const NAME_COLOR = { dark: '#f4f3ef', light: '#17161a' } as const

/**
 * The Work route's own hero — reuses Hero's exact chrome (FoundrLink,
 * tagline, socials, meta block, bottom bar) via `HeroChrome` so nothing but
 * the name changes across the route swap. Same treatment as Hero's own
 * name: a scramble-in reveal on arrival, then WarpText's continuous warp
 * with the occasional glyph-reload tic once settled.
 */
export function ExperienceHero() {
  const reducedMotion = useReducedMotion()
  const { theme } = useTheme()
  const [revealed, setRevealed] = useState(false)

  const reveal = useScrambleReveal('MY WORK', {
    trigger: !reducedMotion,
    duration: 0.7,
    onDone: () => setRevealed(true),
  })
  const transitions = useGlyphReload('MY WORK', { enabled: revealed && !reducedMotion })
  const text = revealed ? 'MY WORK' : reveal

  return (
    <HeroChrome
      name={
        <>
          <WarpText
            text={text}
            ariaLabel="MY WORK"
            color={NAME_COLOR[theme]}
            glyphTransitions={revealed ? transitions : null}
            className="h-[16vw] max-h-[230px] w-[92vw] max-w-[1400px]"
          />
          {/* matches Hero's own two-line block height (DEVARSH/LOKWANI) so
              everything below — meta block, bottom bar — lands at the same
              Y position on both routes */}
          <div aria-hidden="true" className="h-[16vw] max-h-[230px] w-[92vw] max-w-[1400px]" />
        </>
      }
    />
  )
}
