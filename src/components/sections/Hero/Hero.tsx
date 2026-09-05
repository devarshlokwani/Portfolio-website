import { useEffect, useRef, useState } from 'react'

import { HeroChrome } from '@/components/sections/Hero/HeroChrome'
import { WarpText } from '@/components/sections/Hero/WarpText'
import { useGlyphReload } from '@/hooks/useGlyphReload'
import { useIntro } from '@/hooks/useIntro'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useScrambleReveal } from '@/hooks/useScrambleReveal'
import { useTheme } from '@/hooks/useTheme'

// Mirrors --color-fg / --color-fg-muted in theme.css, WarpText rasterizes
// onto a canvas, so it needs resolved color values rather than CSS vars.
const NAME_COLORS = {
  dark: { fg: '#f4f3ef', muted: '#a3a1ab' },
  light: { fg: '#17161a', muted: '#55525c' },
} as const

export function Hero() {
  const { introComplete } = useIntro()
  const reducedMotion = useReducedMotion()
  const { theme } = useTheme()
  const { fg, muted } = NAME_COLORS[theme]
  const nameRef = useRef<HTMLDivElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)

  const [devarshRevealed, setDevarshRevealed] = useState(false)
  const [lokwaniRevealed, setLokwaniRevealed] = useState(false)

  const revealTrigger = introComplete && !reducedMotion
  const devarshReveal = useScrambleReveal('DEVARSH', {
    trigger: revealTrigger,
    duration: 0.7,
    onDone: () => setDevarshRevealed(true),
  })
  const lokwaniReveal = useScrambleReveal('LOKWANI', {
    trigger: revealTrigger,
    duration: 0.7,
    delay: 0.12,
    onDone: () => setLokwaniRevealed(true),
  })

  // Once each word has settled from its initial reveal, keep it "alive" with
  // occasional character reloads: the same glyph(s) slide out one side and
  // a fresh copy slides in from the other, like a magazine swap.
  const devarshTransitions = useGlyphReload('DEVARSH', { enabled: devarshRevealed && !reducedMotion })
  const lokwaniTransitions = useGlyphReload('LOKWANI', { enabled: lokwaniRevealed && !reducedMotion })

  const devarshText = devarshRevealed ? 'DEVARSH' : devarshReveal
  const lokwaniText = lokwaniRevealed ? 'LOKWANI' : lokwaniReveal

  useEffect(() => {
    if (!introComplete) return

    gsap.fromTo(
      nameRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, ease: 'power4.out' },
    )
    gsap.fromTo(
      metaRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.9, delay: reducedMotion ? 0 : 1.1, ease: 'power3.out' },
    )
  }, [introComplete, reducedMotion])

  return (
    <HeroChrome
      nameRef={nameRef}
      metaRef={metaRef}
      animateIn
      name={
        <>
          <WarpText
            text={devarshText}
            ariaLabel="DEVARSH"
            color={fg}
            glyphTransitions={devarshRevealed ? devarshTransitions : null}
            className="h-[16vw] max-h-[230px] w-[92vw] max-w-[1400px]"
          />
          <WarpText
            text={lokwaniText}
            ariaLabel="LOKWANI"
            color={muted}
            glyphTransitions={lokwaniRevealed ? lokwaniTransitions : null}
            className="h-[16vw] max-h-[230px] w-[92vw] max-w-[1400px]"
          />
        </>
      }
    />
  )
}
