import { useEffect, useRef, useState } from 'react'

import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { gsap } from '@/lib/gsap'

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#wall', label: 'Wall' },
  { href: '#contact', label: 'Contact' },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const listRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const pillPrimed = useRef(false)

  // Scroll-spy: highlight whichever section's link is currently centered in view.
  useEffect(() => {
    const sections = LINKS.map((l) => document.querySelector<HTMLElement>(l.href))

    const observer = new IntersectionObserver(
      (entries) => {
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

  // Slide the pill under the hovered link, falling back to the active section.
  useEffect(() => {
    const index = hoverIndex ?? activeIndex
    const pill = pillRef.current
    const list = listRef.current
    const target = index !== null ? linkRefs.current[index] : null
    if (!pill || !list) return

    if (!target) {
      gsap.to(pill, { opacity: 0, duration: 0.3, ease: 'power2.out' })
      return
    }

    const listBox = list.getBoundingClientRect()
    const targetBox = target.getBoundingClientRect()

    gsap.to(pill, {
      x: targetBox.left - listBox.left,
      width: targetBox.width,
      opacity: 1,
      duration: pillPrimed.current ? 0.5 : 0,
      ease: 'power3.out',
    })
    pillPrimed.current = true
  }, [activeIndex, hoverIndex])

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
      <nav
        ref={listRef}
        onMouseLeave={() => setHoverIndex(null)}
        className="relative hidden items-center gap-1 rounded-full border border-border bg-surface/70 p-1 backdrop-blur-md md:flex"
      >
        <div
          ref={pillRef}
          style={{ width: 0 }}
          className="pointer-events-none absolute inset-y-1 left-0 rounded-full bg-fg opacity-0"
        />
        {LINKS.map((link, i) => (
          <a
            key={link.href}
            ref={(el) => {
              linkRefs.current[i] = el
            }}
            href={link.href}
            data-cursor-hover
            onMouseEnter={() => setHoverIndex(i)}
            className={`relative z-10 rounded-full px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors duration-300 ${
              (hoverIndex ?? activeIndex) === i ? 'text-bg' : 'text-fg-muted hover:text-fg'
            }`}
          >
            {link.label}
          </a>
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
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={toggleMenu}
            className="mobile-nav-link font-display text-4xl font-semibold text-fg"
          >
            {link.label}
          </a>
        ))}
      </div>
    </header>
  )
}
