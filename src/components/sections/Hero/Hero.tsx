import { useEffect, useRef } from 'react'

import { NameReveal } from '@/components/sections/Hero/NameReveal'
import { useIntro } from '@/hooks/useIntro'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function Hero() {
  const { introComplete } = useIntro()
  const reducedMotion = useReducedMotion()
  const metaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!introComplete) return

    gsap.fromTo(
      metaRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.9, delay: reducedMotion ? 0 : 1.1, ease: 'power3.out' },
    )
  }, [introComplete, reducedMotion])

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] w-full flex-col justify-center px-6 md:px-10"
    >
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-fg-subtle">
        Sydney, NSW · Graduate Software Engineer
      </p>

      <h1 className="mt-4 font-display font-semibold uppercase leading-[0.85] tracking-tight text-fg">
        <NameReveal
          text="DEVARSH"
          play={introComplete}
          className="block text-[15vw] md:text-[9vw]"
        />
        <NameReveal
          text="LOKWANI"
          play={introComplete}
          className="block text-[15vw] text-fg-muted md:text-[9vw]"
        />
      </h1>

      <div ref={metaRef} className="mt-10 flex max-w-xl flex-col gap-6 opacity-0 md:mt-14">
        <p className="text-lg text-fg-muted md:text-xl">
          I design and build products end to end — from database schema to the pixel that ships —
          currently studying Artificial Intelligence at Macquarie University and shipping
          full-stack features in production.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href="#projects"
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition-transform hover:-translate-y-0.5"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  )
}
