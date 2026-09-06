import type { ReactNode, Ref } from 'react'
import { TbBriefcase2, TbMapPin, TbStack2 } from 'react-icons/tb'

import { useRouteTransition } from '@/app/routeTransition'
import { FoundrLink } from '@/components/sections/Hero/FoundrLink'
import { SocialIcons } from '@/components/sections/Hero/SocialIcons'
import { BorderGlow } from '@/components/ui/BorderGlow'
import { CtaLaunchLink } from '@/components/ui/CtaLaunchLink'
import { ACCENT_GRADIENT } from '@/components/ui/gradients'

interface HeroChromeProps {
  /** The two-line name area: the one piece of this chrome allowed to differ between Home and the Work page. */
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
  /**
   * Replaces the default CTA pair. The Contact route swaps them out, since
   * "View Projects" has no projects to point at from there. Anything passed
   * here should keep the same two shapes (accent fill, then a BorderGlow
   * outline) so the hero reads identically across routes.
   *
   * Pass `null` for no buttons at all, which the Work route does: neither of
   * the defaults leads anywhere useful from a page that is already the work.
   */
  actions?: ReactNode | null
}

/**
 * Everything in the hero except the name, FoundrLink, tagline, socials,
 * the "ship, and actually work." meta block with its buttons, and the
 * bottom info bar. Shared verbatim between Home's Hero and the Work page's
 * own hero so the whole thing reads as one continuous surface across the
 * route swap: only the name changes, nothing else moves, resizes, or pops
 * in/out.
 */
export function HeroChrome({ name, nameRef, metaRef, animateIn = false, actions }: HeroChromeProps) {
  const { goTo } = useRouteTransition()

  // Checked against `undefined`, not with `??`: the Work route passes an
  // explicit `null` to have no buttons at all, and `??` would read that as
  // "not given" and put the default pair straight back.
  const resolvedActions =
    actions === undefined ? (
        <>
          <CtaLaunchLink
            href="#projects"
            label="View Projects"
            onNavigate={() => goTo('/', { hash: '#projects' })}
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition-[transform,translate,rotate,scale] hover:-translate-y-0.5"
          />
          {/* Skills, not "Get in Touch". Contact is its own route with its
              own hero and its own pair of buttons now, so pointing at it
              from here sent people to a page whose first act was to ask
              the same question again. This pair stays on the page it
              belongs to: the work, then what it is built out of. */}
          <BorderGlow className="hover:!border-transparent">
            <CtaLaunchLink
              href="/#skills"
              label="Skills"
              icon={TbStack2}
              tone="fg"
              onNavigate={() => goTo('/', { hash: '#skills' })}
              className="rounded-full px-6 py-3 text-sm font-medium text-fg"
            />
          </BorderGlow>
        </>
    ) : (
      actions
    )

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
          ship, and actually <span style={ACCENT_GRADIENT}>work.</span>
        </p>
        {resolvedActions && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            {resolvedActions}
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-6 bottom-10 hidden items-center justify-between md:flex md:inset-x-10 xl:inset-x-20 2xl:inset-x-40">
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
