import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { LuArrowRight } from 'react-icons/lu'
import { TbBriefcase2, TbHome2 } from 'react-icons/tb'
import { useLocation } from 'react-router-dom'

import { useRouteTransition } from '@/app/RouteTransitionProvider'
import { ACCENT_GRADIENT, GREEN_GRADIENT } from '@/components/ui/gradients'
import { Orb } from '@/components/ui/Orb'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap } from '@/lib/gsap'
import foundrLogo from '@/assets/foundr-logo.png'
import foundrMac from '@/assets/foundr-mac.png'

/**
 * Near-black, not the lifted `surface` these started on. The cards should sit
 * *in* the page rather than on top of it — a visibly lighter panel reads as a
 * grey box pasted onto black, which is the opposite of the submerged look.
 */
const CARD_SURFACE: CSSProperties = {
  backgroundImage:
    'linear-gradient(158deg, color-mix(in srgb, var(--color-bg) 90%, #fff), var(--color-bg) 62%)',
}

function CardShell({
  href,
  external,
  children,
}: {
  href: string
  external?: boolean
  children: ReactNode
}) {
  const { goTo } = useRouteTransition()

  return (
    <a
      href={href}
      data-cursor-hover
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onClick={
        external
          ? undefined
          : (e) => {
              e.preventDefault()
              goTo(href)
            }
      }
      style={CARD_SURFACE}
      className="group relative flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border p-7 transition-colors duration-500 hover:border-accent md:p-8"
    >
      {children}
    </a>
  )
}

/**
 * The bottom row. Its text never darkens on hover — that was making the call
 * to action harder to read at exactly the moment it mattered; the underline
 * carries the state change instead.
 */
function FootRow({ cta }: { cta: string }) {
  return (
    <div className="relative mt-auto flex items-end justify-end pt-10">
      <span className="inline-flex items-center gap-2 font-medium text-fg">
        <span className="relative inline-block">
          {cta}
          {/* the resting track */}
          <span aria-hidden="true" className="absolute -bottom-1 left-0 h-px w-full bg-border" />
          {/* Sweeps in leftward from the right edge, and retracts back the
              same way — a single right-hand origin drives both directions,
              so it never looks like it reverses into a different animation. */}
          <span
            aria-hidden="true"
            className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-accent transition-[transform,translate,rotate,scale] duration-500 ease-out group-hover:scale-x-100"
          />
        </span>
        <LuArrowRight className="h-4 w-4 transition-[transform,translate,rotate,scale] duration-500 group-hover:translate-x-1" />
      </span>
    </div>
  )
}

/**
 * Card one's device: a huge ellipse drawn as a thick blurred *border*, placed
 * so only its crown crosses the card. A filled ellipse would light the whole
 * bottom; the ring leaves darkness beneath the arc for it to read against.
 */
function Arc() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[58%] h-[120%] w-[150%] -translate-x-1/2 rounded-[50%] opacity-50 blur-xl transition-all duration-700 ease-out group-hover:top-[51%] group-hover:opacity-100"
        style={{ border: '26px solid var(--color-accent)' }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[58%] h-[120%] w-[150%] -translate-x-1/2 rounded-[50%] opacity-30 blur-md transition-all duration-700 ease-out group-hover:top-[51%] group-hover:opacity-95"
        style={{ border: '6px solid var(--color-accent)' }}
      />
    </>
  )
}

/** Card one — the arc card, with a brand-style lockup. */
function WorkCard() {
  return (
    <CardShell href="/experience">
      <Arc />

      <div className="relative flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-accent text-accent-fg"
        >
          <TbBriefcase2 className="h-4 w-4" />
        </span>
        <span
          className="font-display text-lg font-semibold lowercase tracking-tight"
          style={ACCENT_GRADIENT}
        >
          experience
        </span>
      </div>

      <h3 className="relative mt-10 font-display text-[1.85rem] font-bold leading-[1.2] text-fg">
        <span className="block">The roles,</span>
        <span className="block">
          the stack <span style={ACCENT_GRADIENT}>&amp;</span>
        </span>
        <span className="block font-accent italic" style={ACCENT_GRADIENT}>
          what shipped.
        </span>
      </h3>

      <FootRow cta="Explore" />
    </CardShell>
  )
}

const TALK_ABOUT = ['a role.', 'a project.', 'an idea.', 'the details.']
/** Seconds a word sits still, and seconds the swap takes. */
const WORD_HOLD = 2.2
const WORD_SWAP = 0.7
/** Height of both the clipping window and each word inside it — they have to
 *  match for the slide-out to clear the frame. */
const WORD_BOX = 'h-[2.6rem] leading-[2.6rem]'

/**
 * Card two — no arc, no mark. Its device is the headline itself, whose last
 * word cycles on a loop.
 *
 * A single node, whose text is swapped while it sits outside the frame.
 * Stacking one span per word and cross-animating them meant any timing fault
 * could put two of them on screen at once; with one node that is impossible.
 */
function ContactCard() {
  const wordRef = useRef<HTMLSpanElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return undefined
    const el = wordRef.current
    if (!el) return undefined

    // Kill anything already driving this node before building a new timeline,
    // so a survivor from a previous mount can't run alongside the new one.
    gsap.killTweensOf(el)

    let index = 0
    const ctx = gsap.context(() => {
      // One element, whose text is swapped while it sits outside the frame.
      // Stacking the four words and cross-animating them meant any timing
      // fault — a stale timeline, a mis-set height — put two of them on
      // screen together. With a single node there is nothing to overlap.
      const tl = gsap.timeline({ repeat: -1 })
      tl.to(el, {
        yPercent: -110,
        duration: WORD_SWAP / 2,
        ease: 'power2.in',
        delay: WORD_HOLD,
      })
      tl.call(() => {
        index = (index + 1) % TALK_ABOUT.length
        el.textContent = TALK_ABOUT[index]
        gsap.set(el, { yPercent: 110 })
      })
      tl.to(el, { yPercent: 0, duration: WORD_SWAP / 2, ease: 'power2.out' })
    })

    return () => {
      ctx.revert()
      // revert restores the node's first word; keep the markup honest
      el.textContent = TALK_ABOUT[0]
    }
  }, [reducedMotion])

  return (
    <CardShell href="/contact">
      {/* one soft bloom behind the type instead of an arc, so this card reads
          as lit from within rather than from below */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-1/4 -top-1/4 h-[75%] w-[110%] rounded-[50%] opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-30"
        style={{ backgroundColor: 'var(--color-accent)' }}
      />

      <p className="relative font-mono text-xs uppercase tracking-[0.3em] text-fg-subtle">
        Say hello
      </p>

      <h3 className="relative mt-10 font-display text-[1.85rem] font-bold leading-[1.2] text-fg">
        <span className="block">Let’s talk</span>
        <span className="block">about</span>
        {/* The word is given the *same* height as the window it slides
            through, so a 110% shift is guaranteed to clear the frame. */}
        <span className={`relative block overflow-hidden ${WORD_BOX}`}>
          <span
            ref={wordRef}
            className={`absolute left-0 top-0 block whitespace-nowrap font-accent italic ${WORD_BOX}`}
            style={ACCENT_GRADIENT}
          >
            {TALK_ABOUT[0]}
          </span>
        </span>
      </h3>

      <p className="relative mt-5 max-w-[15rem] text-sm leading-relaxed text-fg-muted">
        Send a message straight to my inbox: hiring, collaborating, or just talking shop.
      </p>

      <FootRow cta="Contact" />
    </CardShell>
  )
}

/** Card three — the product card. The screenshot is the payload, the way the
 *  reference's third card leans on artwork rather than a headline. */
function FoundrCard() {
  return (
    <CardShell href="https://foundr-xi.vercel.app/" external>
      <div className="relative flex items-center gap-2.5">
        <img src={foundrLogo} alt="" className="h-10 w-10 rounded-[11px] ring-1 ring-emerald-400/20" />
        <span
          className="font-display text-lg font-semibold lowercase tracking-tight"
          style={GREEN_GRADIENT}
        >
          foundr
        </span>
      </div>

      <p className="relative mt-8 max-w-[13rem] text-base leading-relaxed text-fg-muted">
        I built <span className="font-semibold text-fg">Foundr</span>, a finance tracker that
        shows <span className="font-semibold text-fg">solo founders</span> their runway, burn and
        cash left, at a glance.
      </p>

      {/* Parked off the right edge at rest; on hover it slides in and tips its
          far corner up toward the wordmark.

          The transition list matters: Tailwind v4 emits `translate` and
          `rotate` as their own CSS properties, leaving `transform` as `none`.
          Transitioning `transform` therefore animates nothing and the move
          snaps between states — these have to be named individually. */}
      <img
        src={foundrMac}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 right-0 w-[96%] max-w-none translate-x-[46%] rotate-[14deg] opacity-55 transition-[translate,rotate,opacity] duration-700 ease-out group-hover:translate-x-[12%] group-hover:-translate-y-3 group-hover:rotate-[-7deg] group-hover:opacity-100"
      />
      {/* keeps the foot row legible where it passes over the artwork */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{ backgroundImage: 'linear-gradient(to top, var(--color-bg), transparent)' }}
      />

      <FootRow cta="Visit" />
    </CardShell>
  )
}

/** Card four — the way back. Its device is the signature, the site's own
 *  mark, set huge and cropped by the card's edge. */
function HomeCard() {
  return (
    <CardShell href="/">
      <div className="relative flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-accent text-accent-fg"
        >
          <TbHome2 className="h-4 w-4" />
        </span>
        <span
          className="font-display text-lg font-semibold lowercase tracking-tight"
          style={ACCENT_GRADIENT}
        >
          home
        </span>
      </div>

      <h3 className="relative mt-10 font-display text-[1.85rem] font-bold leading-[1.2] text-fg">
        <span className="block">Start again</span>
        <span className="block font-accent italic" style={ACCENT_GRADIENT}>
          from the top.
        </span>
      </h3>

      <p className="relative mt-5 max-w-[15rem] text-sm leading-relaxed text-fg-muted">
        The hero, the philosophy, the projects: the whole tour from the beginning.
      </p>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-6 -left-4 whitespace-nowrap font-signature text-[5.5rem] leading-none text-fg opacity-[0.12] transition-[translate,opacity] duration-700 ease-out group-hover:-translate-y-3 group-hover:opacity-[0.06]"
      >
        Devarsh
      </span>

      <FootRow cta="Home" />
    </CardShell>
  )
}

/**
 * Ordered so that whichever route is filtered out, the remaining three still
 * make a full row. Sliced to three for the routes that match nothing — the
 * legal pages — which would otherwise wrap a fourth card onto its own line.
 */
const CARDS = [
  { id: 'home', path: '/', node: <HomeCard /> },
  { id: 'work', path: '/experience', node: <WorkCard /> },
  { id: 'contact', path: '/contact', node: <ContactCard /> },
  { id: 'foundr', path: null, node: <FoundrCard /> },
]

function Display({ children }: { children: ReactNode }) {
  return (
    <span className="font-display text-4xl font-black uppercase leading-none text-fg md:text-6xl">
      {children}
    </span>
  )
}

/**
 * The block between the last section and the footer.
 *
 * Landing straight on a footer from the end of a page is a dead end — this
 * gives the reader somewhere to go next, then closes on a statement rather
 * than another button. The card for the current route filters itself out, so
 * the Work page never offers a card back to Work.
 */
export function SubFooter() {
  const location = useLocation()
  const cards = CARDS.filter((c) => c.path !== location.pathname).slice(0, 3)

  return (
    // The preceding section already carries its own generous bottom padding,
    // so this one only needs enough top space to separate the two.
    <section className="mx-auto w-full max-w-6xl px-6 pb-14 pt-6 md:px-10 md:pt-10">
      <div className="mb-12 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-fg-subtle">Where next</p>
        <h2 className="mt-4">
          <Display>More to see</Display>
          <br />
          <span
            className="font-accent text-4xl italic leading-none md:text-6xl"
            style={ACCENT_GRADIENT}
          >
            pick a direction.
          </span>
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3 md:gap-8">
        {cards.map((c) => (
          <div key={c.id}>{c.node}</div>
        ))}
      </div>

      {/* The closer: a statement, not another link out. */}
      <div className="mt-20 flex flex-col items-center gap-10 md:mt-28 md:flex-row md:justify-between md:gap-16">
        <div className="max-w-xl text-center md:text-left">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-fg-subtle">
            That’s the tour
          </p>
          <h2 className="mt-5 font-display text-5xl font-black uppercase leading-[0.92] text-fg md:text-7xl">
            Built to be
            <br />
            <span className="font-accent lowercase italic" style={ACCENT_GRADIENT}>
              lived in.
            </span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-fg-muted">
            Every transition, every easing curve, every empty state on this site was tuned by hand.
            That’s the same care I bring to the products I build.
          </p>
        </div>

        <Orb className="h-56 w-56 shrink-0 md:h-72 md:w-72 lg:h-80 lg:w-80" />
      </div>
    </section>
  )
}
