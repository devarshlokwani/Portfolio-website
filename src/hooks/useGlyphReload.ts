import { useEffect, useState } from 'react'

import { gsap } from '@/lib/gsap'

export interface GlyphTransition {
  /** character index within the reloaded string */
  index: number
  /** 0 = old glyph still fully in place, 1 = fully replaced by the fresh copy */
  progress: number
}

interface GlyphReloadOptions {
  enabled: boolean
  /** random gap between reload events, in seconds */
  minInterval?: number
  maxInterval?: number
  /** duration of the first letter's slide in an event */
  baseDuration?: number
}

// Successive letters in a group start with a shrinking gap after the
// previous one and animate a bit quicker each time — a small accelerating
// cascade rather than everything moving in lockstep.
const GROUP_START_OFFSETS = [0, 0.15, 0.25]
const GROUP_DURATION_SCALE = [1, 0.85, 0.7]

/**
 * Occasionally "reloads" a cluster of characters in `target`, like a
 * magazine swap: each one's old glyph slides out to one side while a fresh
 * copy of the same character slides in from the other. Sometimes it's a
 * single letter, sometimes two or three, spaced every other letter (skip
 * one between picks) so a multi-letter event reads as one deliberate
 * pattern rather than a random cluster. Purely a kinetic idle tic — the
 * text content itself never changes, only the transient slide progress fed
 * to WarpText's `glyphTransitions` prop.
 */
export function useGlyphReload(
  target: string,
  { enabled, minInterval = 4.5, maxInterval = 10, baseDuration = 0.4 }: GlyphReloadOptions,
) {
  const [transitions, setTransitions] = useState<GlyphTransition[]>([])

  useEffect(() => {
    setTransitions([])
    if (!enabled) return undefined

    const eligible = Array.from(target).reduce<number[]>((acc, c, i) => (c === ' ' ? acc : [...acc, i]), [])
    const calls: gsap.core.Tween[] = []
    const progressMap = new Map<number, number>()

    const syncState = () => {
      setTransitions(Array.from(progressMap.entries()).map(([index, progress]) => ({ index, progress })))
    }

    const scheduleNext = () => {
      calls.push(gsap.delayedCall(minInterval + Math.random() * (maxInterval - minInterval), runEvent))
    }

    const runEvent = () => {
      if (eligible.length === 0) {
        scheduleNext()
        return
      }

      // sometimes one letter, sometimes a cluster of two or three
      const roll = Math.random()
      const groupSize = Math.min(roll < 0.5 ? 1 : roll < 0.8 ? 2 : 3, Math.ceil(eligible.length / 2))

      // pick letters spaced every other position (skip one between each)
      const maxStart = Math.max(0, eligible.length - 1 - (groupSize - 1) * 2)
      const startPos = Math.floor(Math.random() * (maxStart + 1))
      const indices = Array.from(
        new Set(Array.from({ length: groupSize }, (_, k) => eligible[Math.min(startPos + k * 2, eligible.length - 1)])),
      )

      let pending = indices.length
      indices.forEach((index, k) => {
        const progress = { value: 0 }
        calls.push(
          gsap.to(progress, {
            value: 1,
            duration: baseDuration * (GROUP_DURATION_SCALE[k] ?? GROUP_DURATION_SCALE[GROUP_DURATION_SCALE.length - 1]),
            delay: GROUP_START_OFFSETS[k] ?? GROUP_START_OFFSETS[GROUP_START_OFFSETS.length - 1],
            ease: 'power2.inOut',
            onUpdate: () => {
              progressMap.set(index, progress.value)
              syncState()
            },
            onComplete: () => {
              progressMap.delete(index)
              syncState()
              pending -= 1
              if (pending === 0) scheduleNext()
            },
          }),
        )
      })
    }

    scheduleNext()

    return () => {
      calls.forEach((c) => c.kill())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, target])

  return transitions
}
