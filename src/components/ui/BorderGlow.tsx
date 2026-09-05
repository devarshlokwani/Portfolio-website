import { useCallback, useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react'

interface BorderGlowProps {
  children: ReactNode
  className?: string
  /** How close (0-100) the cursor must get to the edge before the glow starts appearing. */
  edgeSensitivity?: number
  /** "<hue>deg <sat>% <light>%" for the inset/outset glow shadow layers. */
  glowColor?: string
  backgroundColor?: string
  borderRadius?: number
  glowRadius?: number
  glowIntensity?: number
  coneSpread?: number
  /** Colors for the mesh-gradient border ring, repeats cyclically if fewer than 3. */
  colors?: string[]
}

function parseHSL(hslStr: string) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/)
  if (!match) return { h: 40, s: 80, l: 80 }
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) }
}

function buildGlowVars(glowColor: string, intensity: number) {
  const { h, s, l } = parseHSL(glowColor)
  const base = `${h}deg ${s}% ${l}%`
  const opacities = [100, 60, 50, 40, 30, 20, 10]
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10']
  const vars: Record<string, string> = {}
  opacities.forEach((op, i) => {
    vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(op * intensity, 100)}%)`
  })
  return vars
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%']
const GRADIENT_KEYS = [
  '--gradient-one',
  '--gradient-two',
  '--gradient-three',
  '--gradient-four',
  '--gradient-five',
  '--gradient-six',
  '--gradient-seven',
]
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1]

function buildGradientVars(colors: string[]) {
  const vars: Record<string, string> = {}
  GRADIENT_KEYS.forEach((key, i) => {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)]
    vars[key] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`
  })
  vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`
  return vars
}

/**
 * Ported from React Bits' Border Glow (reactbits.dev), pointer position is
 * converted into edge-proximity and angle-from-center, which drive a
 * conic-gradient-masked border glow that tracks the cursor around the
 * element (stronger the closer the pointer gets to the edge). Scaled down
 * from the source's card-sized defaults to fit a small pill button, and
 * colored with the site's own accent instead of the demo's mesh palette.
 */
export function BorderGlow({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '14 100% 60%',
  backgroundColor = 'transparent',
  borderRadius = 9999,
  glowRadius = 6,
  glowIntensity = 1,
  coneSpread = 25,
  colors = ['var(--color-accent)', 'var(--color-accent)', 'var(--color-accent)'],
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const getCenter = useCallback((el: HTMLElement): [number, number] => {
    const { width, height } = el.getBoundingClientRect()
    return [width / 2, height / 2]
  }, [])

  const getEdgeProximity = useCallback(
    (el: HTMLElement, x: number, y: number) => {
      const [cx, cy] = getCenter(el)
      const dx = x - cx
      const dy = y - cy
      let kx = Infinity
      let ky = Infinity
      if (dx !== 0) kx = cx / Math.abs(dx)
      if (dy !== 0) ky = cy / Math.abs(dy)
      return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1)
    },
    [getCenter],
  )

  const getCursorAngle = useCallback(
    (el: HTMLElement, x: number, y: number) => {
      const [cx, cy] = getCenter(el)
      const dx = x - cx
      const dy = y - cy
      if (dx === 0 && dy === 0) return 0
      const radians = Math.atan2(dy, dx)
      let degrees = radians * (180 / Math.PI) + 90
      if (degrees < 0) degrees += 360
      return degrees
    },
    [getCenter],
  )

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const card = cardRef.current
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const edge = getEdgeProximity(card, x, y)
      const angle = getCursorAngle(card, x, y)

      card.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`)
      card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`)
    },
    [getEdgeProximity, getCursorAngle],
  )

  const style = {
    '--card-bg': backgroundColor,
    '--edge-sensitivity': edgeSensitivity,
    '--border-radius': `${borderRadius}px`,
    '--glow-padding': `${glowRadius}px`,
    '--cone-spread': coneSpread,
    ...buildGlowVars(glowColor, glowIntensity),
    ...buildGradientVars(colors),
  } as CSSProperties

  return (
    <div ref={cardRef} onPointerMove={onPointerMove} className={`border-glow-card ${className}`} style={style}>
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </div>
  )
}
