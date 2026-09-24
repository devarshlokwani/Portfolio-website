import { useState } from 'react'

import { LuPenLine, LuMessagesSquare } from 'react-icons/lu'

import { HeroChrome } from '@/components/sections/Hero/HeroChrome'
import { BorderGlow } from '@/components/ui/BorderGlow'
import { CtaLaunchLink } from '@/components/ui/CtaLaunchLink'
import { WarpText } from '@/components/sections/Hero/WarpText'
import { useGlyphReload } from '@/hooks/useGlyphReload'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useScrambleReveal } from '@/hooks/useScrambleReveal'
import { useTheme } from '@/hooks/useTheme'

// Mirrors --color-fg in theme.css: WarpText rasterizes onto a canvas, so
// it needs a resolved color value rather than a CSS var.
const NAME_COLOR = { dark: '#f4f3ef', light: '#17161a' } as const

const TITLE = 'THE WALL'

/**
 * The wall's own hero, built the same way as the Work, Contact and
 * Certificates ones: Hero's exact chrome via `HeroChrome`, so nothing but
 * the name changes across the route swap, and the single line padded by half
 * a line on each side so it sits centred in a block the same height as
 * Home's two-line one.
 *
 * "THE WALL" rather than "SIGN THE WALL": the hero name is set at a size
 * that fits the viewport width, so a longer string is a smaller one, and the
 * two CTAs underneath already say what there is to do here.
 */
export function WallHero() {
  const reducedMotion = useReducedMotion()
  const { theme } = useTheme()
  const [revealed, setRevealed] = useState(false)

  const reveal = useScrambleReveal(TITLE, {
    trigger: !reducedMotion,
    duration: 0.7,
    onDone: () => setRevealed(true),
  })
  const transitions = useGlyphReload(TITLE, { enabled: revealed && !reducedMotion })
  const text = revealed ? TITLE : reveal

  // Both land on the same section, which is the only one on this route, so
  // like the other route heroes these scroll rather than navigate. The pair
  // is kept because the chrome expects two and a lone button reads as an
  // afterthought in a space built for a row.
  const actions = (
    <>
      <CtaLaunchLink
        href="#wall"
        label="Sign It"
        icon={LuPenLine}
        onNavigate={() => document.querySelector('#wall')?.scrollIntoView({ behavior: 'smooth' })}
        className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition-[transform,translate,rotate,scale] hover:-translate-y-0.5"
      />
      <BorderGlow className="hover:!border-transparent">
        <CtaLaunchLink
          href="#wall"
          label="Read Notes"
          icon={LuMessagesSquare}
          tone="fg"
          onNavigate={() => document.querySelector('#wall')?.scrollIntoView({ behavior: 'smooth' })}
          className="rounded-full px-6 py-3 text-sm font-medium text-fg"
        />
      </BorderGlow>
    </>
  )

  return (
    <HeroChrome
      actions={actions}
      name={
        <>
          <div aria-hidden="true" className="h-[8vw] max-h-[115px] w-full" />
          <WarpText
            text={text}
            ariaLabel={TITLE}
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
