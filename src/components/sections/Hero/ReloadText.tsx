import type { CSSProperties } from 'react'

import type { GlyphTransition } from '@/hooks/useGlyphReload'

interface ReloadTextProps {
  text: string
  transitions: GlyphTransition[]
  className?: string
  style?: CSSProperties
}

/**
 * Renders `text` character-by-character, applying the idle "magazine swap"
 * slide-crossfade (see `useGlyphReload`) to any index with an active
 * transition: the current glyph slides left and fades out while a fresh
 * copy slides in from the right and fades in, clipped to that character's
 * own cell. The DOM/CSS counterpart to what used to be drawn on WarpText's
 * canvas - same progress source, different rendering target.
 *
 * Every character cell - transitioning or not - uses the same inline-block
 * + overflow-hidden wrapper. Per the CSS spec, an inline-block with
 * non-visible overflow baselines on its bottom margin edge rather than its
 * text baseline; mixing that with plain inline <span> siblings (which
 * baseline on their text) made the whole line jump vertically the instant a
 * reload event started or stopped. Keeping every cell's box type identical
 * at all times keeps that baseline calculation, and the line's position,
 * constant regardless of which characters happen to be mid-transition.
 */
export function ReloadText({ text, transitions, className, style }: ReloadTextProps) {
  const chars = Array.from(text)

  return (
    <span className={className} style={style}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {chars.map((char, i) => {
          const display = char === ' ' ? ' ' : char
          const transition = transitions.find((t) => t.index === i)
          const p = transition ? Math.min(Math.max(transition.progress, 0), 1) : 0

          return (
            <span key={i} className="relative inline-block overflow-hidden">
              <span
                className="inline-block"
                style={transition ? { transform: `translateX(${-p * 100}%)`, opacity: 1 - p } : undefined}
              >
                {display}
              </span>
              {transition && (
                <span
                  className="absolute inset-0"
                  style={{ transform: `translateX(${(1 - p) * 100}%)`, opacity: p }}
                >
                  {display}
                </span>
              )}
            </span>
          )
        })}
      </span>
    </span>
  )
}
