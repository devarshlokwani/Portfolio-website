import { useRef, useState } from 'react'

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
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-end gap-8 px-6 py-5 md:px-10 md:py-6">
      <nav className="hidden items-center gap-7 md:flex">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="font-mono text-xs uppercase tracking-wide text-fg-muted transition-colors hover:text-fg"
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
