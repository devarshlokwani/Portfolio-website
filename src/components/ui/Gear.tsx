import type { Ref } from 'react'

export const FACE = 'var(--color-accent)'
export const BODY = 'color-mix(in srgb, var(--color-accent) 55%, #000)'
export const BORE_SHADE = 'color-mix(in srgb, var(--color-accent) 34%, #000)'

interface GearGeometry {
  teeth: number
  /** outer radius, at the tooth tips */
  rTip: number
  /** radius of the root land between teeth */
  rRoot: number
  /** the punched-out centre */
  rBore: number
}

/**
 * A gear outline with the bore punched out by `evenodd`, drawn once and
 * reused for both the face and the body behind it.
 *
 * The tooth is built from four points per pitch — root, tip, tip, root —
 * with arcs along the root and tip lands, so the flanks stay straight and
 * the profile reads as machined rather than as a wavy star.
 */
export function gearPath({ teeth, rTip, rRoot, rBore }: GearGeometry) {
  const step = (Math.PI * 2) / teeth
  const tipHalf = step * 0.185
  const rootHalf = step * 0.315
  const pt = (r: number, a: number) =>
    `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`

  let d = `M${pt(rRoot, -rootHalf)}`
  for (let i = 0; i < teeth; i++) {
    const c = i * step
    // the root land leading into this tooth (skipped on the first, which is
    // where the path started)
    if (i > 0) d += ` A${rRoot} ${rRoot} 0 0 1 ${pt(rRoot, c - rootHalf)}`
    d += ` L${pt(rTip, c - tipHalf)}`
    d += ` A${rTip} ${rTip} 0 0 1 ${pt(rTip, c + tipHalf)}`
    d += ` L${pt(rRoot, c + rootHalf)}`
  }
  d += ` A${rRoot} ${rRoot} 0 0 1 ${pt(rRoot, -rootHalf)} Z`

  // the bore — a separate subpath, punched out by fill-rule evenodd
  d +=
    ` M${rBore},0` +
    ` A${rBore} ${rBore} 0 1 0 ${-rBore},0` +
    ` A${rBore} ${rBore} 0 1 0 ${rBore},0 Z`

  return d
}

interface GearProps {
  d: string
  rBore: number
  /**
   * How far the body sits behind the face. Offsetting down-right puts the
   * cut edge on the lower-right outside and, because the bore moves with it,
   * exposes a crescent of body wall inside the upper-left of the hole —
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
 * direction stays fixed while the gear turns — a lit solid keeps its
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
