import { useEffect, useRef } from 'react'

import { Gear } from '@/components/ui/Gear'
import { gearPath } from '@/components/ui/gearGeometry'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Two meshing gears, sized so their pitch circles touch and their teeth
 * interleave rather than pass through each other.
 *
 * Ratio is deliberately 12:8. Equal counts would let the pair drift into
 * lockstep, where both gears show the same tooth at the same angle and the
 * whole thing reads as one rigid shape being spun.
 */
const DRIVER = { teeth: 12, rTip: 40, rRoot: 31, rBore: 12 }
const IDLER = { teeth: 8, rTip: 28, rRoot: 21, rBore: 9 }

const DRIVER_PATH = gearPath(DRIVER)
const IDLER_PATH = gearPath(IDLER)

/** Centre distance: the two root radii, so the tips of each reach into the
 *  root land of the other. */
const SPAN = DRIVER.rRoot + IDLER.rRoot

/** Seconds per turn of the driver. The idler follows at the tooth ratio. */
const PERIOD = 3.2

interface CogLoaderProps {
  /** Accessible status text, read out while the wait lasts. */
  label: string
  className?: string
}

/**
 * The waiting state for anything slow enough to need one. Built from the
 * same gear the cards and the footer use, so a load reads as part of the
 * site's own machinery rather than a borrowed spinner.
 */
export function CogLoader({ label, className = '' }: CogLoaderProps) {
  const rootRef = useRef<SVGSVGElement>(null)
  // Body and face turn as one. The extruded body is a separate group only so
  // its depth offset can stay put while the gear spins; leaving it unrotated
  // would spin the teeth off a stationary shadow.
  const driverBodyRef = useRef<SVGGElement>(null)
  const driverFaceRef = useRef<SVGGElement>(null)
  const idlerBodyRef = useRef<SVGGElement>(null)
  const idlerFaceRef = useRef<SVGGElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return undefined

    const ctx = gsap.context(() => {
      // Meshed gears turn opposite ways, at speeds inverse to their tooth
      // counts. Anything else and the teeth visibly slide through each other.
      gsap.to([driverBodyRef.current, driverFaceRef.current], {
        rotation: 360,
        duration: PERIOD,
        ease: 'none',
        repeat: -1,
        transformOrigin: 'center',
      })
      gsap.to([idlerBodyRef.current, idlerFaceRef.current], {
        rotation: -360 * (DRIVER.teeth / IDLER.teeth),
        duration: PERIOD,
        ease: 'none',
        repeat: -1,
        transformOrigin: 'center',
      })
    }, rootRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center gap-5 ${className}`}>
      <svg
        ref={rootRef}
        aria-hidden="true"
        viewBox="-56 -44 152 112"
        className="h-24 w-32 overflow-visible"
      >
        <Gear
          d={DRIVER_PATH}
          rBore={DRIVER.rBore}
          depth={[4, 6]}
          bodyRef={driverBodyRef}
          faceRef={driverFaceRef}
        />
        <Gear
          d={IDLER_PATH}
          rBore={IDLER.rBore}
          depth={[3, 4]}
          cx={SPAN}
          cy={-14}
          bodyRef={idlerBodyRef}
          faceRef={idlerFaceRef}
        />
      </svg>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-fg-subtle">{label}</p>
    </div>
  )
}
