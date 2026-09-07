import type { ReactNode } from 'react'
import { LuGithub, LuLinkedin, LuMail } from 'react-icons/lu'
import { useLocation } from 'react-router-dom'

import { useRouteTransition } from '@/app/routeTransition'
import dmcaBadge from '@/assets/dmca-badge.png'
import { EMAIL_HREF } from '@/lib/contact'

interface FooterLink {
  label: string
  href: string
  /** hash targets need router-aware handling so they work from any route, not just "/" */
  hash?: boolean
  external?: boolean
}

/**
 * Split by where a link actually goes, not lumped under one "General"
 * heading. Four of these scroll to a place on the home page and two load a
 * page of their own, and a single flat list gave a reader no way to tell
 * which was which until they clicked.
 *
 * "Sections" against "Pages" is the whole distinction in two words: one
 * moves you down a page, the other loads a new one.
 */
const HOME_LINKS: FooterLink[] = [
  { label: 'Home', href: '#hero', hash: true },
  { label: 'About', href: '#about', hash: true },
  { label: 'Skills', href: '#skills', hash: true },
  { label: 'Projects', href: '#projects', hash: true },
]

const PAGE_LINKS: FooterLink[] = [
  { label: 'Work', href: '/experience' },
  { label: 'Certificates', href: '/certificates' },
  { label: 'Contact', href: '/contact' },
]

const APP_LINKS: FooterLink[] = [{ label: 'Foundr', href: 'https://foundr-xi.vercel.app/', external: true }]

const LEGAL_LINKS: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
]

const ICON_LINKS = [
  // GitHub has no real brand color, glow toward the theme's own
  // foreground instead of a fixed hex (see SocialIcons.tsx for the same fix)
  { label: 'GitHub', href: 'https://github.com/devarshlokwani', icon: LuGithub, glow: 'var(--color-fg)' },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/devarsh-lokwani-a802b2296/',
    icon: LuLinkedin,
    glow: '#0a66c2',
  },
  { label: 'Email', href: EMAIL_HREF, icon: LuMail, glow: '#34a853' },
]

function FooterColumn({
  title,
  links,
  below,
}: {
  title: string
  links: FooterLink[]
  /** Anything that belongs to this group rather than to the footer at large. */
  below?: ReactNode
}) {
  const { goTo } = useRouteTransition()

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">{title}</p>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              data-cursor-hover
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              onClick={
                link.hash
                  ? (e) => {
                      e.preventDefault()
                      goTo('/', { hash: link.href })
                    }
                  : link.href.startsWith('/')
                    ? (e) => {
                        e.preventDefault()
                        goTo(link.href)
                      }
                    : undefined
              }
                // The Legal labels are two words each and were breaking across
              // lines in a narrow column, which read as four links rather than
              // two. The column below is sized to hold the longest of them.
              className="whitespace-nowrap text-sm font-medium text-fg transition-colors hover:text-accent"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      {below}
    </div>
  )
}

const DMCA_STATUS_URL =
  'https://www.dmca.com/Protection/Status.aspx?ID=576a0ee9-2945-49b2-b406-2a97016a4ab7'

/**
 * The DMCA badge, under the Legal column where it belongs with the policy
 * links rather than floating beside the copyright line.
 *
 * The image is served from this origin rather than from DMCA's CDN, and
 * their badge-helper script is not loaded. Both would have put a third-party
 * request on every page of a site that otherwise makes none, and handed every
 * visitor's IP address to them before the page had finished loading.
 *
 * That script did exactly one thing worth keeping: append the current page's
 * URL to the link as `refurl`, which is how DMCA.com learns which page to
 * scan. Dropping it outright left their record with no URL at all and the
 * protection status stuck at unavailable, so the one line is reproduced here
 * instead. `useLocation` rather than reading `window` during render, so the
 * value follows a route change; unencoded to match their own script, since
 * that is the shape their end is built to receive.
 *
 * `dmca-badge` is the class their crawler looks for when it checks the page.
 */
function DmcaBadge() {
  const location = useLocation()
  const href =
    typeof window === 'undefined'
      ? DMCA_STATUS_URL
      : `${DMCA_STATUS_URL}&refurl=${window.location.origin}${location.pathname}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-hover
      title="DMCA.com Protection Status"
      className="dmca-badge mt-5 inline-block opacity-60 transition-opacity duration-300 hover:opacity-100"
    >
      <img src={dmcaBadge} alt="DMCA.com Protection Status" width={121} height={24} />
    </a>
  )
}

function Signature({ children }: { children: ReactNode }) {
  return (
    <p className="font-signature text-5xl leading-none tracking-normal text-fg sm:text-6xl md:text-7xl">
      {children}
    </p>
  )
}

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-6 pb-10 pt-4 md:px-10 md:pb-14">
      <div className="rounded-3xl border border-border bg-surface px-8 py-10 md:px-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.25fr] md:gap-12">
          <div>
            <Signature>Devarsh Lokwani</Signature>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-muted">
              Building software that ships, from full-stack features at work to personal projects
              that solve real problems. AI graduate from Macquarie University, spending most of my
              time in the space between clean code and good product sense.
            </p>
          </div>

          {/* Four across only from `lg`. At `md` the footer splits into two
              halves, and four columns inside the narrower of them left the
              content-sized Legal track nothing to give the other three, which
              pushed the page into horizontal scroll. Two rows of two is the
              honest fit until there is room.

              The last track is content-sized rather than an equal quarter, so
              "Terms & Conditions" gets the width it needs and the three
              shorter columns share what is left. */}
          <div className="grid grid-cols-2 gap-6 lg:[grid-template-columns:repeat(3,1fr)_max-content] lg:gap-8">
            <FooterColumn title="Sections" links={HOME_LINKS} />
            <FooterColumn title="Pages" links={PAGE_LINKS} />
            <FooterColumn title="Apps" links={APP_LINKS} />
            <FooterColumn title="Legal" links={LEGAL_LINKS} below={<DmcaBadge />} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse items-center gap-4 border-t border-border pt-6 font-mono text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between md:mt-8">
        <p>© {new Date().getFullYear()} Devarsh Lokwani. All rights reserved.</p>
        <div className="flex items-center gap-5">
          {ICON_LINKS.map(({ label, href, icon: Icon, glow }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('mailto:') ? undefined : '_blank'}
              rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
              aria-label={label}
              data-cursor-hover
              className="footer-icon-link text-fg-subtle transition-[transform,translate,rotate,scale] duration-300 ease-out hover:scale-125"
              style={{ '--icon-glow': glow } as React.CSSProperties}
            >
              <Icon className="footer-icon-link__icon h-4 w-4 transition-colors duration-300" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
