import { useEffect, useRef } from 'react'
import type { IconType } from 'react-icons'
import { LuArrowUpRight, LuMail } from 'react-icons/lu'
import { TbBriefcase2 } from 'react-icons/tb'
import { useLocation } from 'react-router-dom'

import { useRouteTransition } from '@/app/RouteTransitionProvider'
import { Gear, gearPath } from '@/components/ui/Gear'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap } from '@/lib/gsap'

interface Destination {
  id: string
  eyebrow: string
  title: string
  body: string
  cta: string
  icon: IconType
  /** internal route, or an external URL when `external` */
  href: string
  external?: boolean
}

const DESTINATIONS: Destination[] = [
  {
    id: 'work',
    eyebrow: 'Experience',
    title: 'Where I’ve shipped',
    body: 'The roles, the stack behind each one, and what actually went out the door.',
    cta: 'See the work',
    icon: TbBriefcase2,
    href: '/experience',
  },
  {
    id: 'contact',
    eyebrow: 'Say hello',
    title: 'Start a conversation',
    body: 'Hiring, collaborating, or just want to talk shop — the inbox is open.',
    cta: 'Get in touch',
    icon: LuMail,
    href: '/contact',
  },
  {
    id: 'foundr',
    eyebrow: 'Live product',
    title: 'Foundr, in the wild',
    body: 'A finance tracker built for solo founders. Go and click around it.',
    cta: 'Open Foundr',
    icon: LuArrowUpRight,
    href: 'https://foundr-xi.vercel.app/',
    external: true,
  },
]

function DestinationCard({ dest }: { dest: Destination }) {
  const { goTo } = useRouteTransition()
  const Icon = dest.icon

  return (
    <a
      href={dest.href}
      data-cursor-hover
      target={dest.external ? '_blank' : undefined}
      rel={dest.external ? 'noopener noreferrer' : undefined}
      onClick={
        dest.external
          ? undefined
          : (e) => {
              e.preventDefault()
              goTo(dest.href)
            }
      }
      className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-colors duration-500 hover:border-accent md:p-8"
    >
      {/* The arc is the card's whole visual payload: a wide, soft band of
          accent sitting just below the bottom edge, so only its crown shows.
          It lifts and brightens on hover, which is what makes the card feel
          lit from underneath rather than merely outlined. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[42%] left-1/2 h-[70%] w-[130%] -translate-x-1/2 rounded-[50%] opacity-40 blur-2xl transition-all duration-700 ease-out group-hover:-bottom-[36%] group-hover:opacity-90"
        style={{ backgroundColor: 'var(--color-accent)' }}
      />
      {/* a crisper inner edge, so the glow reads as an arc and not a haze */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[46%] left-1/2 h-[70%] w-[118%] -translate-x-1/2 rounded-[50%] opacity-0 blur-md transition-all duration-700 ease-out group-hover:-bottom-[42%] group-hover:opacity-50"
        style={{ backgroundColor: 'var(--color-accent)' }}
      />

      <div className="relative flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-bg text-fg-muted transition-colors duration-300 group-hover:border-accent group-hover:text-accent"
        >
          <Icon className="h-4 w-4" />
        </span>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
          {dest.eyebrow}
        </p>
      </div>

      <div className="relative mt-6">
        <h3 className="font-display text-2xl font-semibold leading-tight text-fg">{dest.title}</h3>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-fg-muted">{dest.body}</p>
      </div>

      {/* On hover the arc washes right over this line, so it flips to the
          on-accent token rather than to accent itself — accent on accent is
          the one combination that disappears. */}
      <span className="relative mt-auto inline-flex items-center gap-2 pt-8 font-mono text-xs uppercase tracking-[0.15em] text-fg transition-colors duration-300 group-hover:text-accent-fg">
        {dest.cta}
        <LuArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </a>
  )
}

const CLOSER_GEAR = gearPath({ teeth: 14, rTip: 100, rRoot: 79, rBore: 44 })

/** The lit gear beside the closing line — the site's motif at full size, as
 *  the last thing before the footer. */
function CloserGear() {
  const bodyRef = useRef<SVGGElement>(null)
  const faceRef = useRef<SVGGElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return undefined
    const parts = [bodyRef.current, faceRef.current].filter(Boolean)
    const root = rootRef.current
    if (!root || !parts.length) return undefined

    const ctx = gsap.context(() => {
      gsap.to(parts, {
        rotation: 300,
        svgOrigin: '0 0',
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    })
    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <div ref={rootRef} aria-hidden="true" className="relative hidden shrink-0 md:block">
      <span
        className="absolute inset-[-30%] rounded-full opacity-25 blur-3xl"
        style={{ backgroundColor: 'var(--color-accent)' }}
      />
      <svg viewBox="-112 -112 224 232" className="relative h-40 w-40 lg:h-52 lg:w-52">
        <Gear d={CLOSER_GEAR} rBore={44} bodyRef={bodyRef} faceRef={faceRef} />
      </svg>
    </div>
  )
}

/**
 * The block between the last section and the footer.
 *
 * Landing straight on a footer from the end of a page is a dead end — this
 * gives the reader somewhere to go next, then closes on a single line. Cards
 * for the current route filter themselves out, so the Work page never offers
 * a card back to Work.
 */
export function SubFooter() {
  const location = useLocation()
  const { goTo } = useRouteTransition()
  const cards = DESTINATIONS.filter((d) => d.external || d.href !== location.pathname)

  return (
    // The preceding section already carries its own generous bottom padding,
    // so this one only needs enough top space to separate the two.
    <section className="mx-auto w-full max-w-6xl px-6 pb-14 pt-6 md:px-10 md:pt-10">
      <div className="mb-12 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-fg-subtle">Where next</p>
        <h2 className="mt-4 font-display text-4xl font-black uppercase leading-none text-fg md:text-6xl">
          More to see
        </h2>
        <p className="mt-2 font-accent text-4xl italic leading-none text-accent md:text-6xl">
          pick a direction.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 md:gap-8">
        {cards.map((dest) => (
          <DestinationCard key={dest.id} dest={dest} />
        ))}
      </div>

      {/* the closer */}
      <div className="mt-20 flex flex-col items-center justify-between gap-8 md:mt-28 md:flex-row">
        <div className="text-center md:text-left">
          <h2 className="font-display text-6xl font-black uppercase leading-[0.9] text-fg md:text-8xl">
            Let’s go<span className="text-accent">.</span>
          </h2>
          <p className="mt-4 font-accent text-2xl italic text-fg-muted md:text-3xl">
            Tell me what you’re building.
          </p>
          <button
            type="button"
            data-cursor-hover
            onClick={() => goTo('/contact')}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-accent-fg transition-transform duration-300 hover:-translate-y-0.5"
          >
            Get in Touch
            <LuArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <CloserGear />
      </div>
    </section>
  )
}
