import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

import { FlightCard } from '@/components/sections/Experience/FlightCard'
import { buildFlightPath, sampleFlightPath, type PathPoint } from '@/components/sections/Experience/flightPathMath'
import { PaperPlaneIcon } from '@/components/sections/Experience/PaperPlaneIcon'
import { Scenery } from '@/components/sections/Experience/Scenery'
import { gsap } from '@/lib/gsap'

interface Job {
  role: string
  company: string
  period: string
  location: string
  points: string[]
  skills: string[]
}

interface FlightPathProps {
  jobs: Job[]
  /** rendered locked at the top of the pinned view, above the paper canvas */
  heading: ReactNode
}

interface Checkpoint {
  x: number
  y: number
  arcLength: number
}

interface Geometry {
  totalWidth: number
  laneHeight: number
  d: string
  totalLength: number
  samples: ReturnType<typeof buildFlightPath>['samples']
  checkpoints: Checkpoint[]
}

function buildGeometry(viewportWidth: number, laneHeight: number, count: number): Geometry {
  const midY = laneHeight / 2
  const amplitude = laneHeight * 0.16
  const marginX = viewportWidth * 0.32
  const segmentWidth = viewportWidth * 0.85
  const totalWidth = marginX * 2 + segmentWidth * count

  const points: PathPoint[] = [{ x: 0, y: midY }]
  for (let i = 0; i < count; i++) {
    points.push({
      x: marginX + segmentWidth * (i + 0.5),
      y: i % 2 === 0 ? midY - amplitude : midY + amplitude,
    })
  }
  points.push({ x: totalWidth, y: midY })

  const { d, totalLength, samples, pointLengths } = buildFlightPath(points, { jitterAmplitude: 5 })
  // read checkpoint x/y back off the jittered samples so the marker sits
  // exactly on the hand-wobbled line, not the original clean control point
  const checkpoints: Checkpoint[] = points.slice(1, -1).map((_p, i) => {
    const arcLength = pointLengths[i + 1]
    const { x, y } = sampleFlightPath(samples, arcLength)
    return { x, y, arcLength }
  })

  return { totalWidth, laneHeight, d, totalLength, samples, checkpoints }
}

/**
 * Pins the section with `heading` locked at the top and turns further
 * scroll into horizontal travel in the paper canvas below it — a paper
 * plane glides along a wandering (not straight) path, leaving a dotted
 * trail behind it (clipped to a rect whose width tracks the plane's x, so
 * the dots only ever exist behind where it's already been), and a widget
 * card fades in as the plane nears each checkpoint and back out as it
 * leaves.
 */
export function FlightPath({ jobs, heading }: FlightPathProps) {
  const pinRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const planeRef = useRef<HTMLDivElement>(null)
  const clipRectRef = useRef<SVGRectElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const markerRefs = useRef<(HTMLDivElement | null)[]>([])

  const [geometry, setGeometry] = useState<Geometry | null>(null)

  useLayoutEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return undefined

    const compute = () => {
      const laneHeight = canvasEl.clientHeight || window.innerHeight
      setGeometry(buildGeometry(window.innerWidth, laneHeight, jobs.length))
    }
    compute()

    let resizeTimer: number
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(compute, 200)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.clearTimeout(resizeTimer)
    }
  }, [jobs.length])

  useLayoutEffect(() => {
    if (!geometry) return undefined
    const pinEl = pinRef.current
    const canvasEl = canvasRef.current
    const track = trackRef.current
    const plane = planeRef.current
    if (!pinEl || !canvasEl || !track || !plane) return undefined

    const { totalWidth, totalLength, samples, checkpoints } = geometry
    const travel = Math.max(1, totalWidth - window.innerWidth)

    // each checkpoint's visible window reaches about 65% of the way to its
    // nearest neighbor on either side — a modest crossfade zone rather than
    // a hard cut, without adjacent cards both sitting at full opacity
    const cpProgress = checkpoints.map((cp) => cp.arcLength / totalLength)
    const halfWindows = cpProgress.map((p, i) => {
      const prevGap = i === 0 ? p : p - cpProgress[i - 1]
      const nextGap = i === cpProgress.length - 1 ? 1 - p : cpProgress[i + 1] - p
      return Math.min(prevGap, nextGap) * 0.65
    })

    // Three-phase camera: the plane enters from the left margin while the
    // track sits still (camera x pinned to 0, so the plane's screen x is
    // just its own local x); once it reaches center, the camera locks on
    // and pans with it (camera x = centerX - planeX, holding the plane
    // dead-center); once the plane is close enough to the right margin
    // that holding center would run the camera past the end of the track,
    // the camera releases and freezes, letting the plane fly on off the
    // right edge. Clamping camera x to [2*centerX - totalWidth, 0] gives
    // all three phases (and their handoffs) for free, no phase branching.
    // Centered on the canvas's own width, not the viewport's — the canvas
    // sits inset inside a max-width layout, narrower than window.innerWidth.
    const centerX = canvasEl.clientWidth / 2
    const camMin = 2 * centerX - totalWidth

    const applyProgress = (progress: number) => {
      const { x, y, angleDeg } = sampleFlightPath(samples, progress * totalLength)
      const camX = Math.max(camMin, Math.min(0, centerX - x))
      gsap.set(track, { x: camX })
      gsap.set(plane, { x: x - 28, y: y - 12, rotation: angleDeg })
      clipRectRef.current?.setAttribute('width', String(Math.max(0, x)))

      checkpoints.forEach((_cp, i) => {
        const dist = Math.abs(progress - cpProgress[i])
        const strength = Math.max(0, 1 - dist / halfWindows[i])
        const card = cardRefs.current[i]
        if (card) {
          card.style.opacity = String(strength)
          card.style.pointerEvents = strength > 0.5 ? 'auto' : 'none'
        }
        const marker = markerRefs.current[i]
        if (marker) marker.style.transform = `translate(-50%, -50%) scale(${1 + strength * 0.35})`
      })
    }

    const ctx = gsap.context(() => {
      // The tween's own target is a throwaway proxy — track.x is now set
      // directly inside applyProgress (camera-follow math above), so all
      // this tween needs to provide is a scrubbed, eased progress value.
      const scrub = { progress: 0 }
      const tween = gsap.to(scrub, {
        progress: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: pinEl,
          start: 'top top',
          end: `+=${travel}`,
          pin: true,
          // Section's own scroll-reveal leaves a leftover GSAP transform on
          // the ancestor <section> once it settles (GSAP animates `y` via
          // transform and doesn't strip it after), which would otherwise
          // become the containing block for `position: fixed` and pin us
          // relative to that ancestor instead of the viewport. Pinning via
          // transform sidesteps that entirely (and is the standard
          // recommendation alongside Lenis regardless).
          pinType: 'transform',
          scrub: 0.4,
          invalidateOnRefresh: true,
          onUpdate: (self) => applyProgress(self.progress),
        },
      })
      applyProgress(tween.scrollTrigger?.progress ?? 0)
    }, pinEl)

    return () => ctx.revert()
  }, [geometry])

  return (
    <div ref={pinRef} className="relative flex h-screen w-full flex-col overflow-hidden">
      <div className="shrink-0 pt-28 md:pt-32">{heading}</div>

      <div ref={canvasRef} className="relative flex-1 overflow-hidden">
        {/* Fixed backdrop — the paper itself and the landscape drawn on it.
            Sized to the canvas (not the much-wider scrolling track), so it
            sits still behind the plane/trail/cards as they travel across
            it, rather than panning along with them. */}
        <div className="absolute inset-0">
          <svg
            className="h-full w-full"
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMax slice"
            aria-hidden="true"
          >
            <defs>
              {/* A gentle, static paper-grain texture: turbulence noise
                  used as a bump map, multiplied over the flat paper
                  color — a fixed, moderate crease level rather than an
                  animated crumple. */}
              <filter id="paper-grain" x="-5%" y="-15%" width="110%" height="130%">
                <feTurbulence type="fractalNoise" baseFrequency="0.004 0.007" numOctaves={4} seed={7} result="noise" />
                <feDiffuseLighting in="noise" surfaceScale={4} diffuseConstant={1.05} lightingColor="#fff8ec" result="light">
                  <feDistantLight azimuth={235} elevation={55} />
                </feDiffuseLighting>
                <feComposite in="light" in2="SourceGraphic" operator="in" result="clippedLight" />
                <feBlend in="clippedLight" in2="SourceGraphic" mode="multiply" />
              </filter>
            </defs>
            <rect x={0} y={0} width={1600} height={900} rx={24} fill="#f4ecd8" filter="url(#paper-grain)" />
          </svg>
        </div>

        {geometry && (
          <div ref={trackRef} className="relative h-full" style={{ width: geometry.totalWidth }}>
            <svg
              className="absolute left-0 top-0"
              width={geometry.totalWidth}
              height={geometry.laneHeight}
              aria-hidden="true"
            >
              <defs>
                <clipPath id="flight-trail-clip">
                  <rect ref={clipRectRef} x={0} y={0} width={0} height={geometry.laneHeight} />
                </clipPath>

                {/* Light edge roughening for the trail — the path already
                    has a hand-wobble baked into its geometry, this filter
                    adds fine surface irregularity on top so it reads as a
                    scribbled crayon line rather than a clean stroke. */}
                <filter id="trail-sketch" x="-10%" y="-60%" width="120%" height="220%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.04 0.09" numOctaves={2} seed={11} result="wobble" />
                  <feDisplacementMap in="SourceGraphic" in2="wobble" scale={1.6} xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>

              {/* offset well clear of each checkpoint card, which is
                  centered on the same x as its checkpoint and would
                  otherwise sit directly on top of — and hide — the doodle.
                  Anchored to the trail's own y at that checkpoint (not the
                  canvas floor), so each doodle sits up near the path
                  itself, to the left of its note. */}
              <Scenery
                windmillX={(geometry.checkpoints[0]?.x ?? geometry.totalWidth * 0.15) - 300}
                windmillY={geometry.checkpoints[0]?.y ?? geometry.laneHeight * 0.5}
                mountainX={(geometry.checkpoints[1]?.x ?? geometry.totalWidth * 0.5) - 300}
                mountainY={geometry.checkpoints[1]?.y ?? geometry.laneHeight * 0.5}
              />

              {/* soft peach glow underneath, then the main crayon-orange dashes, then a thin dark fleck on top — a layered waxy trail rather than one flat dashed line */}
              <g filter="url(#trail-sketch)">
                <path
                  d={geometry.d}
                  fill="none"
                  stroke="#ffcda0"
                  strokeWidth={5.5}
                  strokeLinecap="round"
                  strokeDasharray="1 13"
                  opacity={0.55}
                  clipPath="url(#flight-trail-clip)"
                />
                <path
                  d={geometry.d}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeDasharray="2 11"
                  opacity={0.9}
                  clipPath="url(#flight-trail-clip)"
                />
                <path
                  d={geometry.d}
                  fill="none"
                  stroke="#8a3f18"
                  strokeWidth={1}
                  strokeLinecap="round"
                  strokeDasharray="1.5 12.5"
                  opacity={0.4}
                  clipPath="url(#flight-trail-clip)"
                />

                {geometry.checkpoints.map((cp, i) => (
                  <circle
                    key={jobs[i].company}
                    cx={cp.x}
                    cy={cp.y}
                    r={5}
                    fill="#f4ecd8"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                  />
                ))}
              </g>
            </svg>

            <div ref={planeRef} className="absolute left-0 top-0 h-6 w-14 will-change-transform">
              <PaperPlaneIcon className="h-full w-full drop-shadow-[0_4px_10px_rgba(255,90,60,0.4)]" />
            </div>

            {geometry.checkpoints.map((cp, i) => (
              <div
                key={jobs[i].company}
                ref={(el) => {
                  markerRefs.current[i] = el
                }}
                aria-hidden="true"
                className="absolute h-2.5 w-2.5 rounded-full bg-accent"
                style={{ left: cp.x, top: cp.y, transform: 'translate(-50%, -50%)' }}
              />
            ))}

            {geometry.checkpoints.map((cp, i) => (
              <div
                key={jobs[i].company}
                ref={(el) => {
                  cardRefs.current[i] = el
                }}
                className="absolute opacity-0 transition-opacity duration-150 ease-out"
                style={{
                  left: cp.x,
                  ...(i % 2 === 0 ? { bottom: geometry.laneHeight * 0.06 } : { top: geometry.laneHeight * 0.08 }),
                  transform: 'translateX(-50%)',
                }}
              >
                <FlightCard {...jobs[i]} rotation={i % 2 === 0 ? -2.5 : 2} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
