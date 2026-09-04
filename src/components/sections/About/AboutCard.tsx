import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'

interface AboutCardProps {
  icon: IconType
  /** small tracked caps above the title — what this card is about */
  eyebrow: string
  /** display-face first line */
  title: string
  /** serif-italic second line, same pairing the hero uses */
  subtitle: string
  children: ReactNode
  /** the philosophy card's tab row — the other two cards don't get one */
  footer?: ReactNode
  /** the full-width card carries a larger title than the two half-width ones */
  size?: 'md' | 'lg'
  className?: string
}

/**
 * The shared shell for all three About cards: badge + eyebrow, a two-line
 * title pairing the display face against the serif italic (the same
 * treatment the hero uses for "ship, and actually work."), then the body.
 * `footer` is only used by the philosophy card, which is the one card with
 * a tab row under its copy.
 */
export function AboutCard({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  className = '',
}: AboutCardProps) {
  const titleSize = size === 'lg' ? 'text-3xl md:text-4xl' : 'text-2xl'

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-fg-muted"
        >
          <Icon className="h-4 w-4" />
        </span>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">{eyebrow}</p>
      </div>

      <div>
        <h3 className={`font-display font-semibold leading-tight text-fg ${titleSize}`}>{title}</h3>
        <p className={`font-accent italic leading-tight text-fg-muted ${titleSize}`}>{subtitle}</p>
        <div className="mt-4 text-sm leading-relaxed text-fg-muted">{children}</div>
      </div>

      {footer}
    </div>
  )
}
