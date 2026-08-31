import { useEffect, useRef } from 'react'

import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface SceneryProps {
  windmillX: number
  windmillY: number
  mountainX: number
  mountainY: number
}

const INK = '#b8622f'
const INK_SOFT = '#c98b5c'

const BLADE_SHAPE = 'M0,-6 L-5,-10 L-3,-40 L3,-40 L5,-10 Z'

function WindmillVignette({
  x,
  groundY,
  scale,
  bladeRef,
}: {
  x: number
  groundY: number
  scale: number
  bladeRef: (el: SVGGElement | null) => void
}) {
  return (
    <g
      transform={`translate(${x} ${groundY}) scale(${scale})`}
      stroke={INK}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      <path d="M-34,0 C-36,-9 -40,-14 -46,-18" />
      <path d="M-24,0 C-25,-11 -27,-17 -31,-24" />
      <path d="M28,0 C30,-10 34,-15 40,-19" />

      {/* tapered stone tower, with a couple of coursing lines for texture */}
      <path d="M-13,0 L13,0 L7,-72 L-7,-72 Z" />
      <path d="M-11,-18 L11,-18" opacity={0.6} />
      <path d="M-9,-40 L9,-40" opacity={0.6} />
      <path d="M-4,0 L-4,-14 Q0,-18 4,-14 L4,0" />
      <path d="M-9,-72 L0,-86 L9,-72 Z" fill={INK} stroke="none" />

      {/* sails, spinning around the hub */}
      <g transform="translate(0 -79)">
        <g ref={bladeRef} fill={INK_SOFT} stroke={INK} strokeWidth={1.6}>
          <path d={BLADE_SHAPE} />
          <path d={BLADE_SHAPE} transform="rotate(90)" />
          <path d={BLADE_SHAPE} transform="rotate(180)" />
          <path d={BLADE_SHAPE} transform="rotate(270)" />
        </g>
        <circle r={2.6} fill={INK} stroke="none" />
      </g>
    </g>
  )
}

function MountainVignette({ x, groundY, scale }: { x: number; groundY: number; scale: number }) {
  return (
    <g
      transform={`translate(${x} ${groundY}) scale(${scale})`}
      stroke={INK}
      strokeWidth={2}
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    >
      <path d="M-90,0 L-60,-46 L-38,-20 L-8,-62 L20,-24 L46,-40 L90,0 Z" />
      <path d="M-70,0 L-46,-26 L-24,-8 L4,-34 L34,-2 L70,0 Z" fill={INK_SOFT} opacity={0.3} stroke="none" />
      <g strokeWidth={1.8}>
        <path d="M-100,0 L-100,-30 M-108,-10 L-100,-22 L-92,-10 M-105,-2 L-100,-14 L-95,-2" />
        <path d="M96,0 L96,-24 M89,-8 L96,-18 L103,-8 M92,-1 L96,-11 L100,-1" />
      </g>
    </g>
  )
}

/**
 * Small monochrome doodles living inside the flight track itself (same
 * coordinate space as the trail/checkpoints), so they pan with the camera
 * as it follows the plane instead of sitting rigid while the world moves
 * underneath them. One vignette is pinned near each of the first two
 * checkpoints, like margin sketches next to those particular stops. The
 * windmill's sails are the one animated piece — a slow constant spin via
 * `bladeRef`, driven by the parent.
 */
export function Scenery({ windmillX, windmillY, mountainX, mountainY }: SceneryProps) {
  const bladeRef = useRef<SVGGElement | null>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!bladeRef.current || reducedMotion) return undefined
    const tween = gsap.to(bladeRef.current, {
      rotation: 360,
      duration: 6,
      ease: 'none',
      repeat: -1,
      // GSAP's transformOrigin, for an SVG element, is anchored to that
      // element's own bounding box — a pixel offset like "0px 0px" lands on
      // the box's corner, not on SVG-space (0,0). bladeRef here holds only
      // the 4 blade paths, each the same shape rotated 90°/180°/270° around
      // the true hub, so their union's bounding box is itself centered on
      // the hub — which is exactly what "50% 50%" (the box's own center)
      // resolves to. A literal pixel origin previously sent the whole
      // group swinging through a wide loop instead of spinning in place.
      transformOrigin: '50% 50%',
    })
    return () => {
      tween.kill()
    }
  }, [reducedMotion])

  // grounded a little below the trail's own line at that point, rather
  // than sitting exactly on it or all the way down at the canvas floor
  const GROUND_DROP = 28

  return (
    <g opacity={0.5}>
      <WindmillVignette
        x={windmillX}
        groundY={windmillY + GROUND_DROP}
        scale={1.15}
        bladeRef={(el) => (bladeRef.current = el)}
      />
      <MountainVignette x={mountainX} groundY={mountainY + GROUND_DROP} scale={1} />
    </g>
  )
}
