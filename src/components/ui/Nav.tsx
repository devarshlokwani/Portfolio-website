import { useEffect, useRef, useState } from 'react'

import { NavLink } from '@/components/ui/NavLink'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useLenisInstance } from '@/hooks/useLenisInstance'
import { gsap } from '@/lib/gsap'
import { smoothScrollToHash } from '@/lib/smoothScroll'

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
]

export function Nav() {
  const lenisRef = useLenisInstance()
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

  // Scroll-spy: highlight whichever section's link is currently centered in view.
  useEffect(() => {
    const sections = LINKS.map((l) => document.querySelector<HTMLElement>(l.href))

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
  }, [])

  useEffect(() => {
    return () => {
      if (suppressTimeoutRef.current) clearTimeout(suppressTimeoutRef.current)
    }
  }, [])

  const navigateTo = (index: number, href: string) => {
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

    const handled = smoothScrollToHash(lenisRef.current, href, undefined, resumeSpy)
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
            key={link.href}
            href={link.href}
            label={link.label}
            filled={activeIndex === i || hoverIndex === i}
            onHoverStart={() => setHoverIndex(i)}
            onHoverEnd={() => setHoverIndex((prev) => (prev === i ? null : prev))}
            onNavigate={() => navigateTo(i, link.href)}
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
            key={link.href}
            href={link.href}
            onClick={(e) => {
              navigateTo(i, link.href)
              toggleMenu()
              // the anchor jump still needs suppressing even though the menu
              // is about to be covering the viewport anyway, so the browser
              // doesn't fight Lenis's scroll with its own instant one
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
