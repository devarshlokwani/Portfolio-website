import { useState } from 'react'

import { ScrollPlane } from '@/components/sections/Experience/ScrollPlane'
import { GearBadge } from '@/components/ui/GearBadge'
import { ACCENT_GRADIENT } from '@/components/ui/gradients'

/**
 * The bridge between the Work hero and the flight below it.
 *
 * The section underneath does not behave like the rest of the site: it pins,
 * and scrolling drives a plane along a route rather than moving the page.
 * Arriving at what looks like a static drawing, it is not obvious that
 * scrolling is what makes it play, so this says so in the gap where the
 * question comes up, and then shows it: the small plane at the bottom is
 * wired to scroll position, so the control explains itself before the real
 * flight starts.
 */
export function ScrollCue() {
  const [hovered, setHovered] = useState(false)

  return (
    // The whole block is the hover target for the gear. Scoping it to the
    // nut meant aiming at forty pixels of hexagon; the reader's attention is
    // on the sentence, so the sentence is part of the target.
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-2 pt-1 md:px-10"
    >
      <div className="flex h-20 w-20 items-center justify-center">
        <GearBadge bare size="xl" active={hovered} />
      </div>

      {/* The site's own pairing rather than an eyebrow over a paragraph of
          body copy: tracked mono caps, then a display line answered by the
          serif italic in the accent. The same shape the sub-footer's "Where
          next" and every About card wear, which is what this block was
          missing. The eyebrow's tracking matches the section heading right
          below it, so two labels a hundred pixels apart are not set two
          different ways. */}
      <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
        Keep scrolling
      </p>

      <p className="mt-4 text-center">
        <span className="font-display text-xl font-semibold leading-tight text-fg md:text-2xl">
          The route plays out below,
        </span>
        <br />
        <span
          className="font-accent text-xl italic leading-tight md:text-2xl"
          style={ACCENT_GRADIENT}
        >
          flown as you scroll.
        </span>
      </p>

      <ScrollPlane />
    </div>
  )
}
