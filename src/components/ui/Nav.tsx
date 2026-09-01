import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { useRouteTransition } from '@/app/RouteTransitionProvider'
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
  { kind: 'hash', href: '#contact', label: 'Contact' },
  { kind: 'route', to: '/experience', label: 'Work' },
]

export function Nav() {
  const lenisRef = useLenisInstance()
  const { goTo } = useRouteTransition()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  // A nav-triggered smooth scroll passes through every section between here
  // and the target, and each one crossing the scroll-spy's center threshold
  // along the way would otherwise flip activeIndex (and fire that link's
  // fill animation) for the split-second it's in view — a flicker cascade
  // down the whole nav. Suppressed for the duration of that one scroll; the
  // click itself sets the destination's index immediately instead.
  const suppressSpyRef = useRef(false)
  const suppressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Scroll-spy only applies on the home route, where the hash-linked
  // sections actually live in the DOM. On any other route the nav's active
  // link is just whichever one points at the current route.
  useEffect(() => {
    if (location.pathname !== '/') {
      const routeIndex = LINKS.findIndex((l) => l.kind === 'route' && l.to === location.pathname)
      setActiveIndex(routeIndex === -1 ? null : routeIndex)
      return undefined
    }

    // Coming back to '/' from a route link (e.g. clicking the corner mark
    // while "Work" is active) otherwise leaves that route's stale index in
    // place — nothing here re-evaluates it until a section's own
    // intersection fires, which doesn't happen at all if landing at the
    // very top of the page, above every observed section.
    setActiveIndex(null)

    const sections = LINKS.map((l) => (l.kind === 'hash' ? document.querySelector<HTMLElement>(l.href) : null))

    const observer = new IntersectionObserver(
      (entries) => {
        if (suppressSpyRef.current) return
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const idx = sections.findIndex((s) => s === entry.target)
          if (idx !== -1) setActiveIndex(idx)
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    sections.forEach((s) => s && observer.observe(s))
    return () => observer.disconnect()
  }, [location.pathname])

  useEffect(() => {
    return () => {
      if (suppressTimeoutRef.current) clearTimeout(suppressTimeoutRef.current)
    }
  }, [])

  const navigateTo = (index: number, link: LinkConfig) => {
    setActiveIndex(index)

    if (link.kind === 'route') {
      goTo(link.to)
      return
    }

    if (location.pathname !== '/') {
      goTo('/', { hash: link.href })
      return
    }

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
    // (e.g. the target is already at the current scroll position) — the
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
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-end gap-4 px-6 py-5 md:px-10 md:py-6">
      {/* DL lives in the separate fixed CornerMark component on the far
          left; this nav is centered independently of that, and the theme
          toggle + hamburger stay in normal flow pushed to the right. */}
      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-surface/70 p-1 backdrop-blur-md md:flex">
        {LINKS.map((link, i) => (
          <NavLink
            key={link.label}
            href={link.kind === 'hash' ? link.href : link.to}
            label={link.label}
            filled={activeIndex === i || hoverIndex === i}
            onHoverStart={() => setHoverIndex(i)}
            onHoverEnd={() => setHoverIndex((prev) => (prev === i ? null : prev))}
            onNavigate={() => navigateTo(i, link)}
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
          className="h-px w-5 bg-fg transition-transform duration-300"
          style={{ transform: open ? 'translateY(3.5px) rotate(45deg)' : 'none' }}
        />
        <span
          className="h-px w-5 bg-fg transition-transform duration-300"
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
