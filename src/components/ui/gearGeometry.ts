/**
 * The gear's shared geometry and palette, kept out of `Gear.tsx`.
 *
 * A module that exports both components and plain values cannot be hot
 * reloaded on its own: React Refresh cannot preserve the non-component
 * exports, so an edit anywhere in it reloads the whole page. These are
 * imported by four other modules besides the component, so they belong in
 * their own file regardless.
 */

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
 * The tooth is built from four points per pitch (root, tip, tip, root)
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

  // the bore: a separate subpath, punched out by fill-rule evenodd
  d +=
    ` M${rBore},0` +
    ` A${rBore} ${rBore} 0 1 0 ${-rBore},0` +
    ` A${rBore} ${rBore} 0 1 0 ${rBore},0 Z`

  return d
}
