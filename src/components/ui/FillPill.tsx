import { useEffect, useRef, type ReactNode } from 'react'

import { gsap } from '@/lib/gsap'

const FILL_DURATION = 0.5
// power2.inOut reads as slow-fast-slow: the fill eases into motion, races
// through the middle, then eases back out as it reaches the top, rather
// than growing at a flat constant rate.
const FILL_EASE = 'power2.inOut'

interface FillPillProps {
  active: boolean
  onClick: () => void
  children: ReactNode
  /** padding/sizing for the specific place it's used */
  className?: string
}

/**
 * A pill toggle whose selected state isn't an instant color swap: a solid
 * accent panel grows from the bottom edge up to cover it, and retreats the
 * same way when deselected.
 *
 * Each pill animates itself off its own `active` prop rather than the
 * parent coordinating incoming/outgoing pairs, which means it works
 * unchanged for both exclusive tab rows (one goes down as another comes
 * up) and independent toggles (one goes down with nothing replacing it).
 */
export function FillPill({ active, onClick, children, className = '' }: FillPillProps) {
  const fillRef = useRef<HTMLSpanElement>(null)
  const mounted = useRef(false)

  useEffect(() => {
    const fill = fillRef.current
    if (!fill) return
    // The first pass just establishes whatever state the pill mounts in.
    // Only later changes are worth animating; otherwise a pill that starts
    // selected would play its fill on page load.
    if (!mounted.current) {
      mounted.current = true
      gsap.set(fill, { scaleY: active ? 1 : 0 })
      return
    }
    // `to` rather than `fromTo`, so rapidly toggling reverses from
    // wherever the fill currently sits instead of snapping back first.
    gsap.to(fill, { scaleY: active ? 1 : 0, duration: FILL_DURATION, ease: FILL_EASE })
  }, [active])

  return (
    <button
      type="button"
      data-cursor-hover
      onClick={onClick}
      aria-pressed={active}
      className={`group relative isolate overflow-hidden rounded-full border font-mono text-xs transition-colors duration-300 ${
        active ? 'border-accent' : 'border-border hover:border-accent'
      } ${className}`}
    >
      <span
        ref={fillRef}
        aria-hidden="true"
        className="absolute inset-0 -z-10 origin-bottom bg-accent"
        style={{ transform: 'scaleY(0)' }}
      />
      <span
        className={`transition-colors duration-300 ${
          active ? 'text-accent-fg' : 'text-fg-muted group-hover:text-accent'
        }`}
      >
        {children}
      </span>
    </button>
  )
}
