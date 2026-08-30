import { useCallback, useEffect, useRef, useState } from 'react'

import { useHeroTransitionRegistry } from '@/app/HeroTransitionProvider'
import { HERO_NAME_CLASS, HERO_NAME_STYLE } from '@/components/sections/Hero/heroNameStyle'
import { HeroChrome } from '@/components/sections/Hero/HeroChrome'
import { ReloadText } from '@/components/sections/Hero/ReloadText'
import { useGlyphReload } from '@/hooks/useGlyphReload'
import { useIntro } from '@/hooks/useIntro'
import { gsap } from '@/lib/gsap'
import { SCRAMBLE_CHARS } from '@/lib/scrambleChars'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useScrambleReveal } from '@/hooks/useScrambleReveal'

export function Hero() {
  const { introComplete } = useIntro()
  const reducedMotion = useReducedMotion()
  const { registerHandler } = useHeroTransitionRegistry()
  const nameRef = useRef<HTMLDivElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)

  const [devarshRevealed, setDevarshRevealed] = useState(false)
  const [lokwaniRevealed, setLokwaniRevealed] = useState(false)
  // idle: normal hero, the recurring glyph-reload tic is live. exiting: a
  // route change is underway — both words are scrambling toward their exit
  // text (see playHeroExit).
  const [heroPhase, setHeroPhase] = useState<'idle' | 'exiting'>('idle')
  const [devarshExitText, setDevarshExitText] = useState('DEVARSH')
  const [lokwaniExitText, setLokwaniExitText] = useState('LOKWANI')

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
  // a fresh copy slides in from the other, like a magazine swap. Disabled
  // once a route-exit is underway so it can't fight the scramble below.
  const devarshTransitions = useGlyphReload('DEVARSH', {
    enabled: devarshRevealed && !reducedMotion && heroPhase === 'idle',
  })
  const lokwaniTransitions = useGlyphReload('LOKWANI', {
    enabled: lokwaniRevealed && !reducedMotion && heroPhase === 'idle',
  })

  const devarshText = heroPhase === 'exiting' ? devarshExitText : devarshRevealed ? 'DEVARSH' : devarshReveal
  const lokwaniText = heroPhase === 'exiting' ? lokwaniExitText : lokwaniRevealed ? 'LOKWANI' : lokwaniReveal

  // Route exit: the same scramble-text "glitch" effect already used for the
  // intro reveal (and the idle tic's own char cycling), run once more —
  // DEVARSH scrambles into MY WORK, LOKWANI scrambles away to nothing. The
  // rest of the hero (FoundrLink, tagline, socials, meta, bottom bar) stays
  // put — only the name changes.
  const playHeroExit = useCallback((onComplete: () => void) => {
    setHeroPhase('exiting')

    const devarshEl = document.createElement('span')
    devarshEl.textContent = 'DEVARSH'
    const lokwaniEl = document.createElement('span')
    lokwaniEl.textContent = 'LOKWANI'

    let wordsRemaining = 2
    const onWordDone = () => {
      wordsRemaining -= 1
      if (wordsRemaining > 0) return
      gsap.delayedCall(0.35, onComplete)
    }

    gsap.to(devarshEl, {
      duration: 0.7,
      scrambleText: { text: 'MY WORK', chars: SCRAMBLE_CHARS, speed: 0.4, revealDelay: 0.1 },
      ease: 'none',
      onUpdate: () => setDevarshExitText(devarshEl.textContent || 'DEVARSH'),
      onComplete: onWordDone,
    })
    gsap.to(lokwaniEl, {
      duration: 0.6,
      delay: 0.1,
      scrambleText: { text: '', chars: SCRAMBLE_CHARS, speed: 0.4, revealDelay: 0.1 },
      ease: 'none',
      onUpdate: () => setLokwaniExitText(lokwaniEl.textContent || ''),
      onComplete: onWordDone,
    })
  }, [])

  useEffect(() => {
    registerHandler(playHeroExit)
    return () => registerHandler(null)
  }, [registerHandler, playHeroExit])

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
          <ReloadText
            text={devarshText}
            transitions={heroPhase === 'idle' ? devarshTransitions : []}
            className={`${HERO_NAME_CLASS} text-fg`}
            style={HERO_NAME_STYLE}
          />
          <ReloadText
            text={lokwaniText}
            transitions={heroPhase === 'idle' ? lokwaniTransitions : []}
            className={`${HERO_NAME_CLASS} text-fg-muted`}
            style={HERO_NAME_STYLE}
          />
        </>
      }
    />
  )
}
