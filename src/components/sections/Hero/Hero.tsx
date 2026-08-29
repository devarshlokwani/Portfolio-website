import { useEffect, useRef, useState } from 'react'
import { TbBriefcase2, TbMapPin } from 'react-icons/tb'

import { FoundrLink } from '@/components/sections/Hero/FoundrLink'
import { SocialIcons } from '@/components/sections/Hero/SocialIcons'
import { WarpText } from '@/components/sections/Hero/WarpText'
import { BorderGlow } from '@/components/ui/BorderGlow'
import { useGlyphReload } from '@/hooks/useGlyphReload'
import { useIntro } from '@/hooks/useIntro'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useScrambleReveal } from '@/hooks/useScrambleReveal'
import { useTheme } from '@/hooks/useTheme'

// Mirrors --color-fg / --color-fg-muted in theme.css — WarpText rasterizes
// onto a canvas, so it needs resolved color values rather than CSS vars.
const NAME_COLORS = {
  dark: { fg: '#f4f3ef', muted: '#a3a1ab' },
  light: { fg: '#17161a', muted: '#55525c' },
} as const

export function Hero() {
  const { introComplete } = useIntro()
  const reducedMotion = useReducedMotion()
  const { theme } = useTheme()
  const nameRef = useRef<HTMLDivElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)
  const { fg, muted } = NAME_COLORS[theme]

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
  // occasional character reloads — the same glyph(s) slide out one side and
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
    <section
      id="hero"
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center px-6 pt-32 text-center md:px-10 md:pt-36"
    >
      <FoundrLink />

      <p className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-fg-subtle">
        Sydney, NSW · Graduate Software Engineer
      </p>

      <h1 className="mt-4 flex w-full flex-col items-center uppercase text-fg">
        <div ref={nameRef} className="flex w-full flex-col items-center opacity-0">
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
        </div>
      </h1>

      <div className="mt-6">
        <SocialIcons />
      </div>

      <div
        ref={metaRef}
        className="mt-8 flex max-w-2xl flex-col items-center gap-2 opacity-0 md:mt-10"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-fg-subtle">
          I design and build products that
        </p>
        <p className="font-accent text-4xl italic leading-[1.05] text-fg md:text-6xl">
          ship, and actually work.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#projects"
            data-cursor-hover
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition-transform hover:-translate-y-0.5"
          >
            View Projects
          </a>
          <BorderGlow className="hover:!border-transparent">
            <a
              href="#contact"
              data-cursor-hover
              className="rounded-full px-6 py-3 text-sm font-medium text-fg"
            >
              Get in Touch
            </a>
          </BorderGlow>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-6 bottom-10 hidden items-center justify-between md:flex md:inset-x-10">
        <div className="flex items-center gap-2.5">
          <TbMapPin className="h-5 w-5 text-accent" />
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-fg">
              Based in Sydney,
            </p>
            <p className="font-mono text-xs uppercase tracking-wide text-fg-subtle">Australia</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-fg">
              Full Stack Dev,
            </p>
            <p className="font-mono text-xs uppercase tracking-wide text-fg-subtle">& Builder</p>
          </div>
          <TbBriefcase2 className="h-5 w-5 text-accent" />
        </div>
      </div>
    </section>
  )
}
