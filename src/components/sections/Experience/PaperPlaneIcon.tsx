interface PaperPlaneIconProps {
  className?: string
}

/**
 * Flat, geometric paper-plane silhouette — nose pointing along +x at zero
 * rotation, so it drops straight into the flight path's atan2-based
 * rotation with no extra offset. Two-tone fill (a dimmer under-wing behind
 * the fold line) stands in for the reference photo's shading.
 */
export function PaperPlaneIcon({ className = '' }: PaperPlaneIconProps) {
  return (
    <svg viewBox="0 0 100 40" className={className} aria-hidden="true">
      <polygon points="100,20 6,2 28,20 6,38" fill="var(--color-accent)" />
      <polygon points="100,20 28,20 6,38" fill="var(--color-accent)" fillOpacity="0.55" />
      <line x1="100" y1="20" x2="28" y2="20" stroke="var(--color-bg)" strokeWidth="1" strokeOpacity="0.45" />
    </svg>
  )
}
