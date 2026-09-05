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
 * The Contact route's own hero, the same arrangement as the Work route's:
 * Hero's exact chrome via `HeroChrome`, so nothing but the name changes
 * across the route swap, and the single name line is padded by half a line
 * on each side so it sits centred in a block the same height as Home's
 * two-line one.
 */
export function ContactHero() {
  const reducedMotion = useReducedMotion()
  const { theme } = useTheme()
  const [revealed, setRevealed] = useState(false)

  const reveal = useScrambleReveal('CONTACTS', {
    trigger: !reducedMotion,
    duration: 0.7,
    onDone: () => setRevealed(true),
  })
  const transitions = useGlyphReload('CONTACTS', { enabled: revealed && !reducedMotion })
  const text = revealed ? 'CONTACTS' : reveal

  return (
    <HeroChrome
      name={
        <>
          <div aria-hidden="true" className="h-[8vw] max-h-[115px] w-full" />
          <WarpText
            text={text}
            ariaLabel="CONTACTS"
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
