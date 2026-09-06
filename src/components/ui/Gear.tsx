import type { Ref } from 'react'

import { BODY, BORE_SHADE, FACE } from '@/components/ui/gearGeometry'

interface GearProps {
  d: string
  rBore: number
  /**
   * How far the body sits behind the face. Offsetting down-right puts the
   * cut edge on the lower-right outside and, because the bore moves with it,
   * exposes a crescent of body wall inside the upper-left of the hole,
   * which is what makes it read as a solid disc rather than a flat sticker.
   */
  depth?: [number, number]
  /** where the gear sits in its parent's coordinate space */
  cx?: number
  cy?: number
  /** the two layers rotate together; the depth offset must not */
  bodyRef?: Ref<SVGGElement>
  faceRef?: Ref<SVGGElement>
}

/**
 * One extruded gear: a darker body drawn behind an accent face.
 *
 * The depth offset is applied *outside* the rotating groups, so the shading
 * direction stays fixed while the gear turns, a lit solid keeps its
 * highlight where it is, and only the teeth should appear to move.
 */
export function Gear({
  d,
  rBore,
  depth = [6, 9],
  cx = 0,
  cy = 0,
  bodyRef,
  faceRef,
}: GearProps) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g transform={`translate(${depth[0]} ${depth[1]})`}>
        <g ref={bodyRef}>
          <path d={d} fill={BODY} fillRule="evenodd" />
          {/* the bore wall, darkest where the hole runs deepest */}
          <circle r={rBore} fill="none" stroke={BORE_SHADE} strokeWidth={5} />
        </g>
      </g>
      <g ref={faceRef}>
        <path d={d} fill={FACE} fillRule="evenodd" />
      </g>
    </g>
  )
}
