import { useEffect, useRef, useState } from 'react'
import { LuMapPin } from 'react-icons/lu'

import { Gear, gearPath } from '@/components/ui/Gear'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap } from '@/lib/gsap'
import { buildLandPoints } from '@/lib/worldLand'

interface Place {
  id: string
  label: string
  /** shown under the clock */
  note: string
  lat: number
  lon: number
  tz: string
}

/** Only places that are actually true of me — where I'm based, and where I
 *  worked before that. */
const PLACES: Place[] = [
  { id: 'sydney', label: 'Sydney', note: 'Based here', lat: -33.87, lon: 151.21, tz: 'Australia/Sydney' },
  { id: 'india', label: 'India', note: 'Worked here', lat: 20.59, lon: 78.96, tz: 'Asia/Kolkata' },
]

/* ------------------------------------------------------------------ *
 * Geometry
 * ------------------------------------------------------------------ */

const CANVAS_W = 300
const CANVAS_H = 264
/** Deliberately larger than the frame it's drawn in: the sphere runs off the
 *  left and bottom edges, so you're looking at part of a world rather than a
 *  small ball sitting in a box. */
const GLOBE_CX = 96
const GLOBE_CY = 138
const GLOBE_R = 156

const DEG = Math.PI / 180
const LAT_STEP = 2.6
const LON_ARC = 2.6

/** Resolved once — the coastlines don't move, only the camera does. */
const LAND_POINTS = buildLandPoints(LAT_STEP, LON_ARC)

/**
 * Orthographic projection of a lat/lon onto a sphere seen from (lat0, lon0).
 * `front` is the cosine of the angular distance from the centre of the
 * visible face — positive on the near side, and doubling as a depth cue for
 * fading dots out toward the limb.
 */
function project(lat: number, lon: number, lat0: number, lon0: number) {
  const p = lat * DEG
  const l = (lon - lon0) * DEG
  const p0 = lat0 * DEG
  const front = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l)
  return {
    x: GLOBE_CX + GLOBE_R * Math.cos(p) * Math.sin(l),
    y: GLOBE_CY - GLOBE_R * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)),
    front,
  }
}

/* ------------------------------------------------------------------ *
 * The gear train
 * ------------------------------------------------------------------ */

/** Tooth overlap, so meshed gears bite instead of merely touching. */
const MESH = 5

const HUB = { x: 95, y: 95, r: 34, teeth: 14 }

/**
 * One hub driving four satellites, rather than a chain.
 *
 * A chain placed tangent-to-the-last folds back on itself as soon as the
 * bearings come round — the fifth gear ends up buried inside the first. Every
 * satellite here is placed at its own bearing from the *hub*, so meshing is
 * guaranteed by construction and the cluster always fans out.
 *
 * Satellites counter-rotate against the hub, and angular speed is inversely
 * proportional to radius: that's how real gearing behaves, and it's what
 * stops the cluster reading as five discs that happen to spin.
 */
function buildTrain() {
  const satellites = [
    { r: 24, teeth: 10, bearing: 20 },
    { r: 18, teeth: 9, bearing: 105 },
    { r: 27, teeth: 11, bearing: 190 },
    { r: 15, teeth: 8, bearing: 285 },
  ]

  const gear = (cx: number, cy: number, r: number, teeth: number, rate: number) => {
    const rBore = r * 0.3
    return { cx, cy, rBore, rate, d: gearPath({ teeth, rTip: r, rRoot: r * 0.76, rBore }) }
  }

  return [
    gear(HUB.x, HUB.y, HUB.r, HUB.teeth, 1),
    ...satellites.map((s) => {
      const d = HUB.r + s.r - MESH
      return gear(
        HUB.x + d * Math.cos(s.bearing * DEG),
        HUB.y + d * Math.sin(s.bearing * DEG),
        s.r,
        s.teeth,
        -HUB.r / s.r,
      )
    }),
  ]
}

const TRAIN = buildTrain()
/** Degrees the anchor gear turns per degree the globe spins. */
const GEAR_RATIO = 1.4
/** Extra turn the train picks up from a full scroll pass, so it isn't dead
 *  until someone clicks something. */
const SCROLL_TURN = 150

export function GlobeWidget({ className = '' }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const gearRefs = useRef<(SVGGElement | null)[]>([])
  const camRef = useRef({ lat: PLACES[0].lat, lon: PLACES[0].lon, spin: 0, scroll: 0 })
  const drawRef = useRef<() => void>(() => {})
  const reducedMotion = useReducedMotion()

  const [activeId, setActiveId] = useState(PLACES[0].id)
  const [time, setTime] = useState('')
  const active = PLACES.find((p) => p.id === activeId) ?? PLACES[0]

  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat('en-AU', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: active.tz,
        }).format(new Date()),
      )
    tick()
    // nothing here changes faster than a minute, so a 1s interval would be
    // pure wakeups
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [active.tz])

  /** Both drives feed one transform, so a click mid-scroll doesn't fight. */
  const applyGears = () => {
    const { spin, scroll } = camRef.current
    const base = spin * GEAR_RATIO + scroll * SCROLL_TURN
    TRAIN.forEach((g, i) => {
      const t = `rotate(${(base * g.rate).toFixed(2)})`
      gearRefs.current[i * 2]?.setAttribute('transform', t)
      gearRefs.current[i * 2 + 1]?.setAttribute('transform', t)
    })
  }

  // --- painting ---------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = CANVAS_W * dpr
    canvas.height = CANVAS_H * dpr
    ctx.scale(dpr, dpr)

    const styles = getComputedStyle(document.documentElement)
    const fg = styles.getPropertyValue('--color-fg').trim()
    const accent = styles.getPropertyValue('--color-accent').trim()

    const draw = () => {
      const { lat: lat0, lon: lon0 } = camRef.current
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

      // a faint lift toward the limb, so the sphere has a body behind the
      // land rather than dots floating in the dark
      const glow = ctx.createRadialGradient(
        GLOBE_CX,
        GLOBE_CY,
        GLOBE_R * 0.55,
        GLOBE_CX,
        GLOBE_CY,
        GLOBE_R,
      )
      glow.addColorStop(0, 'rgba(255,255,255,0)')
      glow.addColorStop(0.82, 'rgba(255,255,255,0.03)')
      glow.addColorStop(1, 'rgba(255,255,255,0.09)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(GLOBE_CX, GLOBE_CY, GLOBE_R, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = fg
      for (const [lat, lon] of LAND_POINTS) {
        const { x, y, front } = project(lat, lon, lat0, lon0)
        if (front <= 0.03) continue
        ctx.globalAlpha = 0.08 + front * 0.5
        ctx.beginPath()
        ctx.arc(x, y, 1.25, 0, Math.PI * 2)
        ctx.fill()
      }

      // markers last, so they sit on top of the land they're pinned to
      for (const place of PLACES) {
        const { x, y, front } = project(place.lat, place.lon, lat0, lon0)
        if (front <= 0) continue
        const on = place.id === activeId
        ctx.globalAlpha = front
        ctx.fillStyle = on ? accent : fg
        ctx.beginPath()
        ctx.arc(x, y, on ? 4.5 : 2.6, 0, Math.PI * 2)
        ctx.fill()
        if (on) {
          ctx.globalAlpha = front * 0.4
          ctx.strokeStyle = accent
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(x, y, 10, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.fillStyle = fg
      }
      ctx.globalAlpha = 1

      // the label rides the marker as real DOM text rather than canvas
      // fillText, so it keeps the site's font and stays selectable-crisp
      const label = labelRef.current
      if (label) {
        const { x, y, front } = project(active.lat, active.lon, lat0, lon0)
        label.style.opacity = front > 0.12 ? '1' : '0'
        label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -170%)`
      }
    }

    drawRef.current = draw
    draw()
    return undefined
  }, [activeId, active.lat, active.lon])

  // --- the spin to the selected place -----------------------------------
  useEffect(() => {
    const cam = camRef.current

    // take the short way round: a raw tween from 151°E to 79°E would swing
    // the long way across the Pacific whenever the delta crosses ±180
    let delta = active.lon - cam.lon
    delta -= Math.round(delta / 360) * 360

    if (reducedMotion) {
      cam.lat = active.lat
      cam.lon += delta
      cam.spin += delta
      applyGears()
      drawRef.current()
      return undefined
    }

    const tween = gsap.to(cam, {
      lat: active.lat,
      lon: cam.lon + delta,
      spin: cam.spin + delta,
      duration: 1.3,
      ease: 'power3.inOut',
      onUpdate: () => {
        applyGears()
        drawRef.current()
      },
    })
    return () => {
      tween.kill()
    }
  }, [active.lat, active.lon, reducedMotion])

  // --- the train also idles along with the page scroll ------------------
  useEffect(() => {
    if (reducedMotion) return undefined
    const root = rootRef.current
    if (!root) return undefined

    const ctx = gsap.context(() => {
      gsap.to(camRef.current, {
        scroll: 1,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
        onUpdate: applyGears,
      })
    })
    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <div
      ref={rootRef}
      className={`relative overflow-hidden rounded-2xl border border-border bg-surface ${className}`}
      style={{ height: CANVAS_H }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ width: CANVAS_W, height: CANVAS_H }}
        className="absolute left-0 top-0 block"
      />

      {/* rides the active marker */}
      <div
        ref={labelRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-bg px-2.5 py-1 font-mono text-[11px] text-fg transition-opacity duration-300"
      >
        <LuMapPin className="h-3 w-3 text-accent" />
        {active.label}
      </div>

      {/* the mechanism, filling the space the globe doesn't reach */}
      <svg
        aria-hidden="true"
        viewBox="0 0 190 190"
        className="pointer-events-none absolute -right-3 bottom-1 h-[190px] w-[190px]"
        style={{ opacity: 0.26 }}
      >
        {TRAIN.map((g, i) => (
          <Gear
            key={i}
            d={g.d}
            rBore={g.rBore}
            cx={g.cx}
            cy={g.cy}
            depth={[1.6, 2.4]}
            bodyRef={(node) => {
              gearRefs.current[i * 2] = node
            }}
            faceRef={(node) => {
              gearRefs.current[i * 2 + 1] = node
            }}
          />
        ))}
      </svg>

      <div className="relative flex h-full flex-col items-end justify-between p-5 text-right">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">
          Where I Am
        </p>

        <div>
          <ul className="flex justify-end gap-2">
            {PLACES.map((place) => {
              const on = place.id === activeId
              return (
                <li key={place.id}>
                  <button
                    type="button"
                    data-cursor-hover
                    aria-pressed={on}
                    onClick={() => setActiveId(place.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors duration-300 ${
                      on
                        ? 'border-accent bg-accent text-accent-fg'
                        : 'border-border bg-bg/70 text-fg-muted hover:border-accent hover:text-accent'
                    }`}
                  >
                    {place.label}
                  </button>
                </li>
              )
            })}
          </ul>

          <p className="mt-3 font-display text-2xl font-semibold leading-none text-fg">
            {time || '—'}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-fg-subtle">
            {active.note}
          </p>
        </div>
      </div>
    </div>
  )
}
