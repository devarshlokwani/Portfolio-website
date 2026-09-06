import { useState } from 'react'

import { LuLayoutGrid, LuList } from 'react-icons/lu'

import type { CertificateView } from '@/components/sections/Certificates/Certificates'
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

const TITLE = 'CERTIFICATES'

/**
 * The Certificates route's own hero, built the same way as the Work and
 * Contact ones: Hero's exact chrome via `HeroChrome`, so nothing but the
 * name changes across the route swap, and the single line padded by half a
 * line on each side so it sits centred in a block the same height as Home's
 * two-line one.
 */
interface CertificatesHeroProps {
  /** Selects the view on the section below; the page owns the state. */
  onSelect: (view: CertificateView) => void
}

export function CertificatesHero({ onSelect }: CertificatesHeroProps) {
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

  // The hero's own pair, in place of the inherited "View Projects" and
  // "Skills": neither has anything to point at from here. Same two shapes
  // as Home's, and like the contact route's pair they only switch what is
  // mounted below rather than scrolling to it, since that section is
  // already the next thing on the page.
  const actions = (
    <>
      <CtaLaunchLink
        href="#certificates"
        label="Quick View"
        icon={LuList}
        onNavigate={() => onSelect('quick')}
        className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition-[transform,translate,rotate,scale] hover:-translate-y-0.5"
      />
      <BorderGlow className="hover:!border-transparent">
        <CtaLaunchLink
          href="#certificates"
          label="Wall View"
          icon={LuLayoutGrid}
          tone="fg"
          onNavigate={() => onSelect('wall')}
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
