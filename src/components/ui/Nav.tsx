import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { useRouteTransition } from '@/app/routeTransition'
import { SURFACE_SHEEN } from '@/components/ui/gradients'
import { NavLink } from '@/components/ui/NavLink'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useLenisInstance } from '@/hooks/useLenisInstance'
import { gsap } from '@/lib/gsap'
import { smoothScrollToHash } from '@/lib/smoothScroll'

type LinkConfig =
  | { kind: 'hash'; href: string; label: string }
  | { kind: 'route'; to: string; label: string }

const LINKS: LinkConfig[] = [
  { kind: 'hash', href: '#about', label: 'About' },
  { kind: 'hash', href: '#skills', label: 'Skills' },
  { kind: 'hash', href: '#projects', label: 'Projects' },
  { kind: 'route', to: '/contact', label: 'Contact' },
  { kind: 'route', to: '/experience', label: 'Work' },
  { kind: 'route', to: '/certificates', label: 'Certs' },
]

/**
 * One pill, divided: places on the home page to the left of the rule, routes
 * that leave it to the right. Mixed into a single undivided row there was
 * nothing to tell a reader that three of these scroll and two navigate away.
 *
 * Each entry carries its position in `LINKS` so the scroll-spy and hover
 * state, which are both index-based, keep working across the division.
 */
const PAGE_LINKS = LINKS.map((link, index) => ({ link, index })).filter(
  (entry) => entry.link.kind === 'hash',
)
const ROUTE_LINKS = LINKS.map((link, index) => ({ link, index })).filter(
  (entry) => entry.link.kind === 'route',
)

export function Nav() {
  const lenisRef = useLenisInstance()
  const { goTo } = useRouteTransition()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  /**
   * The highlighted link, tagged with the route it was decided on.
   *
   * Coming back to '/' from a route link otherwise leaves that route's index
   * in place, because nothing re-evaluates it until a section's own
   * intersection fires, which never happens at all when landing at the top
   * of the page above every observed section. Carrying the path alongside
   * the index means a reading from a different page simply does not count,
   * which resets the highlight during render rather than through an effect
   * that writes state the moment it runs.
   */
  const [spy, setSpy] = useState<{ path: string; index: number | null }>({
    path: location.pathname,
    index: null,
  })
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  // On any route other than home there is no scroll-spy: the active link is
  // just whichever one points at the page you are on, which is a fact about
  // the URL and needs no state at all.
  const routeIndex = LINKS.findIndex((l) => l.kind === 'route' && l.to === location.pathname)
  const activeIndex =
    (spy.path === location.pathname ? spy.index : null) ?? (routeIndex === -1 ? null : routeIndex)

  /**
   * Records a reading against the page it was taken on. Memoised on the
   * path it defaults to, so the scroll-spy effect below can depend on it
   * without being torn down and rebuilt on every render.
   */
  const setActiveIndex = useCallback(
    (
      next: number | null | ((prev: number | null) => number | null),
      path = location.pathname,
    ) => {
      setSpy((prev) => ({
        path,
        index: typeof next === 'function' ? next(prev.path === path ? prev.index : null) : next,
      }))
    },
    [location.pathname],
  )

  // A nav-triggered smooth scroll passes through every section between here
  // and the target, and each one crossing the scroll-spy's center threshold
  // along the way would otherwise flip activeIndex (and fire that link's
  // fill animation) for the split-second it's in view, a flicker cascade
  // down the whole nav. Suppressed for the duration of that one scroll; the
  // click itself sets the destination's index immediately instead.
  const suppressSpyRef = useRef(false)
  const suppressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Scroll-spy only applies on the home route, where the hash-linked
  // sections actually live in the DOM. Everywhere else `activeIndex` above
  // already reads the answer straight off the URL, so there is nothing to
  // observe and nothing to reset.
  useEffect(() => {
    if (location.pathname !== '/') return undefined

    const sections = LINKS.map((l) => (l.kind === 'hash' ? document.querySelector<HTMLElement>(l.href) : null))

    // Mirrors the observer's own '-45% 0px -45% 0px' rootMargin, the
    // center 10% band of the viewport that counts as "intersecting".
    const findIndexInBand = () => {
      const bandTop = window.innerHeight * 0.45
      const bandBottom = window.innerHeight * 0.55
      for (let i = 0; i < sections.length; i++) {
        const rect = sections[i]?.getBoundingClientRect()
        if (rect && rect.top < bandBottom && rect.bottom > bandTop) return i
      }
      return null
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (suppressSpyRef.current) return
        for (const entry of entries) {
          const idx = sections.findIndex((s) => s === entry.target)
          if (idx === -1) continue
          if (entry.isIntersecting) {
            setActiveIndex(idx)
          } else {
            // The exiting section only tells us it left the band, not
            // what (if anything) is in it now, an instant jump (e.g. the
            // corner mark's back-to-top, or scrolling above the topmost
            // hash section into Hero) can skip every section in between
            // without any of them ever registering as intersecting, so
            // there's no later entry to correct a stale index. Recomputing
            // from actual geometry whenever the *active* section is the
            // one exiting covers both that case and the plain "scrolled
            // back up past About" case, instead of leaving whatever was
            // last active stuck on indefinitely.
            setActiveIndex((prev) => (prev === idx ? findIndexInBand() : prev))
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    sections.forEach((s) => s && observer.observe(s))
    return () => observer.disconnect()
  }, [location.pathname, setActiveIndex])

  useEffect(() => {
    return () => {
      if (suppressTimeoutRef.current) clearTimeout(suppressTimeoutRef.current)
    }
  }, [])

  const navigateTo = (index: number, link: LinkConfig) => {
    // A click that navigates records its reading against the page it is
    // going to, not the one it is leaving, so the highlight is already right
    // when the destination mounts instead of being thrown away as a reading
    // from somewhere else.
    if (link.kind === 'route') {
      setActiveIndex(index, link.to)
      goTo(link.to)
      return
    }

    if (location.pathname !== '/') {
      setActiveIndex(index, '/')
      goTo('/', { hash: link.href })
      return
    }

    setActiveIndex(index)
    suppressSpyRef.current = true
    if (suppressTimeoutRef.current) clearTimeout(suppressTimeoutRef.current)

    const resumeSpy = () => {
      suppressSpyRef.current = false
      if (suppressTimeoutRef.current) {
        clearTimeout(suppressTimeoutRef.current)
        suppressTimeoutRef.current = null
      }
    }

    const handled = smoothScrollToHash(lenisRef.current, link.href, undefined, resumeSpy)
    if (!handled) {
      resumeSpy()
      return
    }
    // Safety net in case Lenis's onComplete doesn't fire for some edge case
    // (e.g. the target is already at the current scroll position), the
    // scroll-spy should never stay suppressed indefinitely.
    suppressTimeoutRef.current = setTimeout(resumeSpy, 1600)
  }

  const toggleMenu = () => {
    const next = !open
    setOpen(next)

    if (next) {
      gsap.fromTo(
        menuRef.current,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 0.5, ease: 'power3.inOut' },
      )
      gsap.fromTo(
        '.mobile-nav-link',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, delay: 0.15, ease: 'power3.out' },
      )
    } else {
      gsap.to(menuRef.current, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.4,
        ease: 'power3.inOut',
      })
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-end gap-4 px-6 py-5 md:px-10 md:py-6 xl:px-20 xl:py-10 2xl:px-40">
      {/* DL lives in the separate fixed CornerMark component on the far
          left; this nav is centered independently of that, and the theme
          toggle + hamburger stay in normal flow pushed to the right. */}
      <nav
        style={SURFACE_SHEEN}
        className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-surface/70 p-1 backdrop-blur-md md:flex"
      >
        {PAGE_LINKS.map(({ link, index }) => (
          <NavLink
            key={link.label}
            href={link.kind === 'hash' ? link.href : link.to}
            label={link.label}
            filled={activeIndex === index || hoverIndex === index}
            onHoverStart={() => setHoverIndex(index)}
            onHoverEnd={() => setHoverIndex((prev) => (prev === index ? null : prev))}
            onNavigate={() => navigateTo(index, link)}
          />
        ))}

        <span aria-hidden="true" className="mx-2 h-5 w-px shrink-0 bg-border" />

        {ROUTE_LINKS.map(({ link, index }) => (
          <NavLink
            key={link.label}
            href={link.kind === 'hash' ? link.href : link.to}
            label={link.label}
            variant="outlined"
            filled={activeIndex === index || hoverIndex === index}
            onHoverStart={() => setHoverIndex(index)}
            onHoverEnd={() => setHoverIndex((prev) => (prev === index ? null : prev))}
            onNavigate={() => navigateTo(index, link)}
          />
        ))}
      </nav>

      <ThemeToggle />

      <button
        type="button"
        onClick={toggleMenu}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
      >
        <span
          className="h-px w-5 bg-fg transition-[transform,translate,rotate,scale] duration-300"
          style={{ transform: open ? 'translateY(3.5px) rotate(45deg)' : 'none' }}
        />
        <span
          className="h-px w-5 bg-fg transition-[transform,translate,rotate,scale] duration-300"
          style={{ transform: open ? 'translateY(-3.5px) rotate(-45deg)' : 'none' }}
        />
      </button>

      <div
        ref={menuRef}
        style={{ clipPath: 'inset(0 0 100% 0)' }}
        className="fixed inset-0 top-0 z-30 flex flex-col items-start justify-center gap-6 bg-bg px-8 md:hidden"
      >
        {LINKS.map((link, i) => (
          <a
            key={link.label}
            href={link.kind === 'hash' ? link.href : link.to}
            onClick={(e) => {
              navigateTo(i, link)
              toggleMenu()
              // the anchor jump still needs suppressing even though the menu
              // is about to be covering the viewport anyway, so the browser
              // doesn't fight Lenis's scroll (or the router) with its own
              // instant one
              e.preventDefault()
            }}
            className="mobile-nav-link font-display text-4xl font-semibold text-fg"
          >
            {link.label}
          </a>
        ))}
      </div>
    </header>
  )
}
