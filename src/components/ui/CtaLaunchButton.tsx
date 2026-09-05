import type { IconType } from 'react-icons'

import { SpeedLaunchVisual, useSpeedLaunch } from '@/components/ui/speedLaunch'

interface CtaLaunchButtonProps {
  label: string
  className: string
  icon?: IconType
  disabled?: boolean
  /** called at the launch beat instead of the button's default submit */
  onLaunch: () => void
  /** see SpeedLaunchVisual: "accent" (default) for a solid accent-fill CTA, "fg" for a bordered/transparent one */
  tone?: 'accent' | 'fg'
}

/**
 * An accent CTA button (e.g. a form submit) with the same speed-line launch
 * flourish as `CtaLaunchLink` (see `useSpeedLaunch`), `onLaunch` fires the
 * real action a beat before the label rolls back in. Rendered as
 * `type="submit"`, so a plain Enter-to-submit from a form field still works
 * (it just skips the flourish, going straight through the browser's normal
 * submit path: nothing here to animate in that case anyway).
 */
export function CtaLaunchButton({ label, className, icon, disabled = false, onLaunch, tone }: CtaLaunchButtonProps) {
  const { play, ...refs } = useSpeedLaunch()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    play(onLaunch)
  }

  return (
    <button
      type="submit"
      disabled={disabled}
      data-cursor-hover
      onClick={handleClick}
      className={`relative isolate overflow-hidden ${className}`}
    >
      <SpeedLaunchVisual label={label} icon={icon} tone={tone} {...refs} />
    </button>
  )
}
