import type { IconType } from 'react-icons'

import { SpeedLaunchVisual, useSpeedLaunch } from '@/components/ui/speedLaunch'

interface CtaLaunchLinkProps {
  href: string
  label: string
  className: string
  icon?: IconType
  /** target="_blank" + window.open, for links that leave the page open (e.g. a project's live site) */
  external?: boolean
  /** for non-external links: called instead of the default anchor navigation, once the launch beat fires */
  onNavigate?: () => void
  /** see SpeedLaunchVisual: "accent" (default) for a solid accent-fill CTA, "fg" for a bordered/transparent one */
  tone?: 'accent' | 'fg'
}

/**
 * An accent CTA link with the speed-line launch flourish (see
 * `useSpeedLaunch`): the real navigation (or new-tab open, for external
 * links) fires at the launch beat, a moment before the label rolls back in.
 * That reset matters because neither use case unmounts the link: an
 * in-page scroll leaves it sitting in the hero, and an external project
 * link opens in a new tab while this page doesn't move at all.
 */
export function CtaLaunchLink({
  href,
  label,
  className,
  icon,
  external = false,
  onNavigate,
  tone,
}: CtaLaunchLinkProps) {
  const { play, ...refs } = useSpeedLaunch()

  const fire = () => {
    if (external) {
      // Chrome (and other engines) keep a several-second "transient
      // activation" window open after a real click, so window.open still
      // counts as user-initiated this ~0.76s into the timeline. It isn't
      // limited to strictly synchronous calls. Firing it here (rather than
      // immediately on click) matters for real UX, not just sequencing:
      // opening a tab immediately steals focus, which backgrounds this
      // page and freezes the rest of the flourish mid-animation (Chromium
      // throttles rAF in background tabs), so the whole point of building
      // it would go mostly unseen. Firing after the animation completes
      // means it always plays out first.
      window.open(href, '_blank', 'noopener,noreferrer')
    } else {
      onNavigate?.()
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    e.stopPropagation()
    play(fire)
  }

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      data-cursor-hover
      onClick={handleClick}
      className={`relative isolate overflow-hidden ${className}`}
    >
      <SpeedLaunchVisual label={label} icon={icon} tone={tone} {...refs} />
    </a>
  )
}
