import type { ReactNode, Ref } from 'react'
import { TbBriefcase2, TbMapPin } from 'react-icons/tb'

import { useRouteTransition } from '@/app/RouteTransitionProvider'
import { FoundrLink } from '@/components/sections/Hero/FoundrLink'
import { SocialIcons } from '@/components/sections/Hero/SocialIcons'
import { BorderGlow } from '@/components/ui/BorderGlow'
import { CtaLaunchLink } from '@/components/ui/CtaLaunchLink'

interface HeroChromeProps {
  /** The two-line name area — the one piece of this chrome allowed to differ between Home and the Work page. */
  name: ReactNode
  /**
   * Home only: refs + baseline `opacity-0` for the intro reveal-in Hero
   * drives itself once the intro sequence completes. The Work page has no
   * intro to reveal from, so it omits these and everything renders fully
   * visible immediately.
   */
  nameRef?: Ref<HTMLDivElement>
  metaRef?: Ref<HTMLDivElement>
  animateIn?: boolean
}

/**
 * Everything in the hero except the name — FoundrLink, tagline, socials,
 * the "ship, and actually work." meta block with its buttons, and the
 * bottom info bar. Shared verbatim between Home's Hero and the Work page's
 * own hero so the whole thing reads as one continuous surface across the
 * route swap: only the name changes, nothing else moves, resizes, or pops
 * in/out.
 */
export function HeroChrome({ name, nameRef, metaRef, animateIn = false }: HeroChromeProps) {
  const { goTo } = useRouteTransition()

  const goToHash = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    goTo('/', { hash })
  }

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center px-6 pt-32 text-center md:px-10 md:pt-36"
    >
      <div>
        <FoundrLink />
      </div>

      <p className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-fg-subtle">
        Sydney, NSW · Graduate Software Engineer
      </p>

      <h1 className="mt-4 flex w-full flex-col items-center uppercase text-fg">
        <div ref={nameRef} className={`flex w-full flex-col items-center ${animateIn ? 'opacity-0' : ''}`}>
          {name}
        </div>
      </h1>

      <div className="mt-6">
        <SocialIcons />
      </div>

      <div
        ref={metaRef}
        className={`mt-8 flex max-w-2xl flex-col items-center gap-2 md:mt-10 ${animateIn ? 'opacity-0' : ''}`}
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-fg-subtle">
          I design and build products that
        </p>
        <p className="font-accent text-4xl italic leading-[1.05] text-fg md:text-6xl">
          ship, and actually work.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <CtaLaunchLink
            href="#projects"
            label="View Projects"
            onNavigate={() => goTo('/', { hash: '#projects' })}
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition-transform hover:-translate-y-0.5"
          />
          <BorderGlow className="hover:!border-transparent">
            <a
              href="#contact"
              data-cursor-hover
              onClick={goToHash('#contact')}
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
