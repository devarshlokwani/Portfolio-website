import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'
import { LuFileText } from 'react-icons/lu'

import {
  SPEED_LAUNCH,
  type SpeedLaunchRefs,
  type SpeedLaunchSize,
} from '@/components/ui/useSpeedLaunch'

interface SpeedLaunchVisualProps extends SpeedLaunchRefs {
  /**
   * A node rather than a string, so a link can keep its own leading and
   * trailing marks and have the whole lockup roll out together.
   */
  label: ReactNode
  icon?: IconType
  /** must match the size passed to `useSpeedLaunch`, or the fan and the icon disagree */
  size?: SpeedLaunchSize
  /**
   * Icon/line color: "accent" (text-accent-fg, the default) is for CTAs
   * with a solid accent-colored fill, where accent-fg is what actually
   * contrasts. A CTA with a transparent/bordered background (no accent
   * fill) needs "fg" instead: accent-fg is tuned against the *accent*
   * color specifically, and reads as near-invisible (near-black on dark
   * theme, near-white on light) against a plain page-colored background.
   */
  tone?: 'accent' | 'fg'
}

/** The label + icon/speed-line burst markup, shared by every CTA that uses `useSpeedLaunch`. */
export function SpeedLaunchVisual({
  label,
  icon: Icon = LuFileText,
  tone = 'accent',
  size = 'default',
  labelRef,
  burstRef,
  groupRef,
  iconRef,
  lineRefs,
}: SpeedLaunchVisualProps) {
  const textTone = tone === 'accent' ? 'text-accent-fg' : 'text-fg'
  const bgTone = tone === 'accent' ? 'bg-accent-fg' : 'bg-fg'
  const scale = SPEED_LAUNCH[size]
  return (
    <>
      <span ref={labelRef} className="relative z-10 block">
        {label}
      </span>
      <span
        ref={burstRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0"
      >
        <span ref={groupRef} className="relative flex items-center justify-center">
          <span className="absolute right-full top-1/2 mr-1">
            {scale.lines.map((cfg, i) => (
              <span
                key={i}
                ref={(el) => {
                  lineRefs.current[i] = el
                }}
                className={`absolute right-0 origin-right rounded-full opacity-0 ${bgTone}`}
                style={{
                  top: cfg.y,
                  width: cfg.length,
                  height: cfg.thickness,
                  marginTop: -cfg.thickness / 2,
                }}
              />
            ))}
          </span>
          <span ref={iconRef} className="flex items-center justify-center">
            <Icon className={`${scale.iconClass} ${textTone}`} />
          </span>
        </span>
      </span>
    </>
  )
}
