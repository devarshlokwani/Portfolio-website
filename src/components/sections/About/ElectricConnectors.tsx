import { useEffect, useRef } from 'react'

import { gsap } from '@/lib/gsap'

interface ElectricConnectorsProps {
  /** true while the cursor is anywhere over the About cards group. */
  active: boolean
  /** live mouse position in viewport coordinates, written by the parent's
   *  onMouseMove without triggering a re-render on every pixel of movement. */
  mouseRef: React.RefObject<{ x: number; y: number }>
}

// Pixel-space geometry for the connector row — kept in real pixels rather
// than percentages so the three orbs never drift out of alignment with
// each other regardless of the row's own responsive width. The row has no
// margin of its own (see the wrapper below): its own height *is* the gap
// between the top card and the two lower cards, so a dot centered at y=0
// sits exactly on the top card's bottom border, and a dot at y=ROW_HEIGHT
// sits exactly on the lower cards' top border — straddling the seam
// instead of floating above it.
const ROW_WIDTH = 220
const ROW_HEIGHT = 84
const ORB_SIZE = 44
const TOP = { x: 110, y: 0 }
const LEFT = { x: 65, y: ROW_HEIGHT }
const RIGHT = { x: 155, y: ROW_HEIGHT }

// How close the cursor needs to be to the *nearest* orb for the cluster as
// a whole to reach full intensity, and how far before it's back to its dim
// resting glow — this is the "closer overall = brighter overall" reach.
const MAX_DIST = 420
// The three orbs sit only ~50-90px apart from each other, so that same
// long-range falloff applied independently to each one barely
// differentiates them — being 60px from the one you're "on" is still
// almost as close, on a 420px scale, as being 0px from it. This second,
// much tighter radius instead measures each orb's distance *relative to
// whichever orb is currently nearest*, so a gap that small actually reads
// as a real difference between "the one under the cursor" and "the other
// two" once the cluster itself is close enough to be lit at all.
const LOCAL_RADIUS = 90

// The core carries the actual "electricity" (full range, visibly
// expanding). The outer halo is only ever meant to read as a light ambient
// bleed, at rest *and* at full intensity — capping its own opacity well
// below the core's, rather than sharing the same 0-1 range, is what keeps
// it from turning into a saturated flood once something's close by.
const REST_OPACITY = 0.28
const HOT_OPACITY = 1
const GLOW_REST_OPACITY = 0.1
const GLOW_HOT_OPACITY = 0.32
const REST_GLOW_SCALE = 1
const HOT_GLOW_SCALE = 1.15
// The core's own box (inset-[25%] below) is already 50% of the orb's
// diameter at rest — starting the scale multiplier at 1 keeps that as the
// true baseline, rather than shrinking it down further with an extra
// factor, which was reading as "barely there" instead of "resting".
const REST_CORE_SCALE = 1
const HOT_CORE_SCALE = 1.7

function Orb({ orbRef, glowRef, coreRef }: {
  orbRef: (node: HTMLDivElement | null) => void
  glowRef: (node: HTMLSpanElement | null) => void
  coreRef: (node: HTMLSpanElement | null) => void
}) {
  return (
    <div ref={orbRef} className="absolute" style={{ width: ORB_SIZE, height: ORB_SIZE, transform: 'translate(-50%, -50%)' }}>
      {/* ambient bleed — tight and subtle, not a flood */}
      <span
        ref={glowRef}
        className="absolute inset-[-18%] rounded-full blur-md"
        style={{ backgroundColor: 'var(--color-accent)', opacity: GLOW_REST_OPACITY }}
      />
      <span className="absolute inset-0 rounded-full border border-border" style={{ backgroundColor: '#101013' }} />
      {/* the actual "electricity" — a core that grows outward from the
          center as intensity rises, not just a color/opacity shift */}
      <span
        ref={coreRef}
        className="absolute inset-[25%] rounded-full blur-[3px]"
        style={{ backgroundColor: 'var(--color-accent)', opacity: REST_OPACITY, transform: `scale(${REST_CORE_SCALE})` }}
      />
    </div>
  )
}

/**
 * The three "plasma joint" orbs sitting right on the seam between the
 * About section's top card and the two cards below it — half of each orb
 * overlapping its neighboring card's border, so the cluster reads as part
 * of the boxes rather than a separate floating decoration. At rest each
 * orb glows dimly; while the cursor is anywhere over the About cards,
 * every orb's intensity tracks live distance from the cursor to that
 * specific orb's real on-screen position — the nearer one brightens (and
 * its core visibly expands) while the other two stay comparatively dim.
 */
export function ElectricConnectors({ active, mouseRef }: ElectricConnectorsProps) {
  const orbEls = useRef<(HTMLDivElement | null)[]>([])
  const glowEls = useRef<(HTMLSpanElement | null)[]>([])
  const coreEls = useRef<(HTMLSpanElement | null)[]>([])
  const quickSetters = useRef<
    {
      glowOpacity: (v: number) => void
      glowScaleX: (v: number) => void
      glowScaleY: (v: number) => void
      coreOpacity: (v: number) => void
      coreScaleX: (v: number) => void
      coreScaleY: (v: number) => void
    }[]
  >([])
  // The ticker callback below is registered once on mount and never torn
  // down/recreated on hover changes (that would mean re-creating the
  // quickTo setters too), so it can't just close over the `active` prop —
  // that would freeze it at whatever `active` was on the very first
  // render. It reads this ref instead, kept in sync every render.
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    // quickTo gives each property its own smoothed, interruptible tween
    // that a per-frame proximity update can just keep re-targeting — far
    // cheaper than spinning up a fresh gsap.to() every tick, and it
    // naturally eases rather than snapping when the cursor jumps around.
    // 'scale' itself isn't a safe quickTo target — GSAP logs "scale not
    // eligible for reset" on every call and the value never actually
    // updates — so uniform scaling goes through scaleX/scaleY as a pair
    // instead.
    quickSetters.current = glowEls.current.map((glow, i) => {
      const core = coreEls.current[i]
      return {
        glowOpacity: glow ? gsap.quickTo(glow, 'opacity', { duration: 0.35, ease: 'power2.out' }) : () => {},
        glowScaleX: glow ? gsap.quickTo(glow, 'scaleX', { duration: 0.35, ease: 'power2.out' }) : () => {},
        glowScaleY: glow ? gsap.quickTo(glow, 'scaleY', { duration: 0.35, ease: 'power2.out' }) : () => {},
        coreOpacity: core ? gsap.quickTo(core, 'opacity', { duration: 0.35, ease: 'power2.out' }) : () => {},
        coreScaleX: core ? gsap.quickTo(core, 'scaleX', { duration: 0.4, ease: 'power2.out' }) : () => {},
        coreScaleY: core ? gsap.quickTo(core, 'scaleY', { duration: 0.4, ease: 'power2.out' }) : () => {},
      }
    })

    const tick = () => {
      if (!activeRef.current) return
      const { x: mx, y: my } = mouseRef.current

      const dists = orbEls.current.map((orb) => {
        if (!orb) return Infinity
        const rect = orb.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        return Math.hypot(mx - cx, my - cy)
      })
      const minDist = Math.min(...dists)

      // How close the cursor is to the cluster as a whole — this alone
      // decides whether the orbs light up at all as you approach from
      // anywhere in the section.
      const groupT = gsap.utils.clamp(0, 1, 1 - minDist / MAX_DIST)
      const groupIntensity = groupT * groupT

      dists.forEach((dist, i) => {
        // How much farther *this* orb is than the nearest one — small on
        // an absolute scale, but that's the point: it's measured against
        // the tight LOCAL_RADIUS, not the long-range MAX_DIST, so it
        // still swings from 1 (this is the nearest orb) down toward a
        // floor (the other two) well within that ~50-90px gap.
        const extra = dist - minDist
        const relT = gsap.utils.clamp(0, 1, 1 - extra / LOCAL_RADIUS)
        const relBoost = relT * relT * relT
        // A floor keeps the non-nearest orbs dimly present rather than
        // snapping to fully dark — "dimmer than the one it's sitting on,"
        // not "off."
        const eased = groupIntensity * (0.3 + 0.7 * relBoost)

        const setters = quickSetters.current[i]
        const glowScale = REST_GLOW_SCALE + (HOT_GLOW_SCALE - REST_GLOW_SCALE) * eased
        const coreScale = REST_CORE_SCALE + (HOT_CORE_SCALE - REST_CORE_SCALE) * eased
        setters?.glowOpacity(GLOW_REST_OPACITY + (GLOW_HOT_OPACITY - GLOW_REST_OPACITY) * eased)
        setters?.glowScaleX(glowScale)
        setters?.glowScaleY(glowScale)
        setters?.coreOpacity(REST_OPACITY + (HOT_OPACITY - REST_OPACITY) * eased)
        setters?.coreScaleX(coreScale)
        setters?.coreScaleY(coreScale)
      })
    }

    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
    }
  }, [])

  // Dropping back to resting state is its own explicit step (not just
  // "stop updating") — otherwise an orb the cursor happened to be right on
  // top of when it left the section would stay stuck at full brightness.
  useEffect(() => {
    if (active) return
    quickSetters.current.forEach((setters) => {
      setters?.glowOpacity(GLOW_REST_OPACITY)
      setters?.glowScaleX(REST_GLOW_SCALE)
      setters?.glowScaleY(REST_GLOW_SCALE)
      setters?.coreOpacity(REST_OPACITY)
      setters?.coreScaleX(REST_CORE_SCALE)
      setters?.coreScaleY(REST_CORE_SCALE)
    })
  }, [active])

  const positions = [TOP, LEFT, RIGHT]

  return (
    <div className="relative z-10 mx-auto hidden md:block" style={{ width: ROW_WIDTH, height: ROW_HEIGHT }}>
      {positions.map((pos, i) => (
        <div key={i} className="absolute" style={{ left: pos.x, top: pos.y }}>
          <Orb
            orbRef={(node) => {
              orbEls.current[i] = node
            }}
            glowRef={(node) => {
              glowEls.current[i] = node
            }}
            coreRef={(node) => {
              coreEls.current[i] = node
            }}
          />
        </div>
      ))}
    </div>
  )
}
