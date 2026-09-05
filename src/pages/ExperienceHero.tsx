import { useState } from 'react'

import { HeroChrome } from '@/components/sections/Hero/HeroChrome'
import { WarpText } from '@/components/sections/Hero/WarpText'
import { useGlyphReload } from '@/hooks/useGlyphReload'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useScrambleReveal } from '@/hooks/useScrambleReveal'
import { useTheme } from '@/hooks/useTheme'

// Mirrors --color-fg in theme.css: WarpText rasterizes onto a canvas, so
// it needs a resolved color value rather than a CSS var.
const NAME_COLOR = { dark: '#f4f3ef', light: '#17161a' } as const

/**
 * The Work route's own hero, reusing Hero's exact chrome (FoundrLink,
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
          {/* Hero's name block is two lines tall (DEVARSH/LOKWANI); this one
              is a single line, so it's padded by half a line on each side.
              That keeps the block's total height identical, everything
              below still lands at the same Y on both routes, while sitting
              the one line in the middle of it rather than up at the top. */}
          <div aria-hidden="true" className="h-[8vw] max-h-[115px] w-full" />
          <WarpText
            text={text}
            ariaLabel="MY WORK"
            color={NAME_COLOR[theme]}
            glyphTransitions={revealed ? transitions : null}
            className="h-[16vw] max-h-[230px] w-[92vw] max-w-[1400px]"
          />
          <div aria-hidden="true" className="h-[8vw] max-h-[115px] w-full" />
        </>
      }
    />
  )
}
