import { useRef, useState } from 'react'

import { ScrambleText } from '@/components/intro/ScrambleText'
import { buildIntroWordClassNames, INTRO_WORDS } from '@/components/intro/introWords'
import { useIntro } from '@/hooks/useIntro'
import { gsap } from '@/lib/gsap'

export function IntroLoader() {
  const { introComplete, skipped, completeIntro } = useIntro()
  const [wordsDone, setWordsDone] = useState(false)
  const [wordClassNames] = useState(buildIntroWordClassNames)
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelTopRef = useRef<HTMLDivElement>(null)
  const panelBottomRef = useRef<HTMLDivElement>(null)

  if (introComplete) return null

  const handleWordsDone = () => {
    setWordsDone(true)

    const tl = gsap.timeline({ onComplete: completeIntro })
    tl.to(panelTopRef.current, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, 0)
    tl.to(panelBottomRef.current, { yPercent: 100, duration: 0.9, ease: 'power4.inOut' }, 0)
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[100]" aria-hidden={wordsDone}>
      <div ref={panelTopRef} className="absolute inset-x-0 top-0 h-1/2 bg-bg" />
      <div ref={panelBottomRef} className="absolute inset-x-0 bottom-0 h-1/2 bg-bg" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <ScrambleText
          words={INTRO_WORDS}
          onDone={handleWordsDone}
          skip={skipped}
          className="font-display text-[12vw] font-semibold uppercase leading-none tracking-tight text-fg md:text-[6vw]"
          wordClassNames={wordClassNames}
        />
      </div>
    </div>
  )
}
