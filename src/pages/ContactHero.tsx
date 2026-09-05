import { useState } from 'react'

import { LuMessageSquare, LuPhone } from 'react-icons/lu'

import type { ContactMode } from '@/components/sections/Contact/Contact'
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

/**
 * The Contact route's own hero, the same arrangement as the Work route's:
 * Hero's exact chrome via `HeroChrome`, so nothing but the name changes
 * across the route swap, and the single name line is padded by half a line
 * on each side so it sits centred in a block the same height as Home's
 * two-line one.
 */
interface ContactHeroProps {
  /** Selects the panel on the section below; the page owns the state, since
   *  the section's own switch drives it too. */
  onSelect: (mode: ContactMode) => void
}

export function ContactHero({ onSelect }: ContactHeroProps) {
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

  // The hero's own pair, reused rather than a second set of buttons further
  // down the page: same two shapes as Home's. They only switch which panel
  // is mounted below. Scrolling to it as well fought the reader, since the
  // panel is already the next thing on the page and the pair doubles as the
  // toggle between the two, so every switch would have re-thrown the page
  // down to somewhere it already was.
  const go = (mode: ContactMode) => () => onSelect(mode)

  const actions = (
    <>
      <CtaLaunchLink
        href="#contact"
        label="Book a Call"
        icon={LuPhone}
        onNavigate={go('call')}
        className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition-[transform,translate,rotate,scale] hover:-translate-y-0.5"
      />
      <BorderGlow className="hover:!border-transparent">
        <CtaLaunchLink
          href="#contact"
          label="Send a Message"
          icon={LuMessageSquare}
          tone="fg"
          onNavigate={go('message')}
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
