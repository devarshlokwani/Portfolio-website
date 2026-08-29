import { useEffect, useRef } from 'react'
import { TbBriefcase2, TbMapPin } from 'react-icons/tb'

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

      <div ref={metaRef} className="mt-10 flex max-w-2xl flex-col gap-2 opacity-0 md:mt-14">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-fg-subtle">
          I design and build products that
        </p>
        <p className="font-accent text-4xl italic leading-[1.05] text-fg md:text-6xl">
          ship, and actually work.
        </p>
        <p className="mt-4 max-w-xl text-fg-muted md:text-lg">
          Currently studying Artificial Intelligence at Macquarie University and shipping
          full-stack features in production — from database schema to the pixel that ships.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <a
            href="#projects"
            data-cursor-hover
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition-transform hover:-translate-y-0.5"
          >
            View Projects
          </a>
          <a
            href="#contact"
            data-cursor-hover
            className="rounded-full border border-border px-6 py-3 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent"
          >
            Get in Touch
          </a>
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
