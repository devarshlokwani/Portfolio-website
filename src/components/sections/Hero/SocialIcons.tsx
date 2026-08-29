import type { IconType } from 'react-icons'
import { LuGithub, LuLinkedin, LuMail } from 'react-icons/lu'

interface SocialLink {
  label: string
  href: string
  icon: IconType
  /** Brand color the icon glows/tints toward on hover. */
  glow: string
}

const LINKS: SocialLink[] = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/devarsh-lokwani-a802b2296/',
    icon: LuLinkedin,
    glow: '#0a66c2',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/devarshlokwani',
    icon: LuGithub,
    glow: '#f4f3ef',
  },
  {
    label: 'Email',
    href: 'mailto:devarshlokwani480@gmail.com',
    icon: LuMail,
    glow: '#34a853',
  },
]

/**
 * Circular icon buttons with clean line-drawn (Lucide) icons — on hover the
 * icon does a quick nervous wiggle and glows toward its brand color, while
 * the ring border also tints to match.
 */
export function SocialIcons() {
  return (
    <div className="flex items-center gap-3">
      {LINKS.map(({ label, href, icon: Icon, glow }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith('mailto:') ? undefined : '_blank'}
          rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
          aria-label={label}
          data-cursor-hover
          className="social-icon-btn group flex h-11 w-11 items-center justify-center rounded-full border border-border text-fg-muted transition-colors duration-300 hover:border-[var(--social-glow)]"
          style={{ '--social-glow': glow } as React.CSSProperties}
        >
          <Icon className="social-icon-btn__icon h-4 w-4 transition-colors duration-300" />
        </a>
      ))}
    </div>
  )
}
