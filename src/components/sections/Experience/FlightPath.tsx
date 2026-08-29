import { useLayoutEffect, useRef, useState } from 'react'

import { FlightCard } from '@/components/sections/Experience/FlightCard'
import { buildFlightPath, sampleFlightPath, type PathPoint } from '@/components/sections/Experience/flightPathMath'
import { PaperPlaneIcon } from '@/components/sections/Experience/PaperPlaneIcon'
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

  const { d, totalLength, samples, pointLengths } = buildFlightPath(points)
  const checkpoints: Checkpoint[] = points
    .slice(1, -1)
    .map((p, i) => ({ x: p.x, y: p.y, arcLength: pointLengths[i + 1] }))

  return { totalWidth, laneHeight, d, totalLength, samples, checkpoints }
}

/**
 * Pins the section and turns further scroll into horizontal travel — a
 * paper plane glides along a wandering (not straight) path, leaving a
 * dotted trail behind it (an accent-colored dashed copy of the path,
 * clipped to a rect whose width tracks the plane's x — so the dots only
 * ever exist behind where the plane has already been), and a widget card
 * fades in as the plane nears each checkpoint and back out as it leaves.
 */
export function FlightPath({ jobs }: FlightPathProps) {
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const planeRef = useRef<HTMLDivElement>(null)
  const clipRectRef = useRef<SVGRectElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const markerRefs = useRef<(HTMLDivElement | null)[]>([])

  const [geometry, setGeometry] = useState<Geometry | null>(null)

  useLayoutEffect(() => {
    const pinEl = pinRef.current
    if (!pinEl) return undefined

    const compute = () => {
      const laneHeight = pinEl.clientHeight || window.innerHeight
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
    const track = trackRef.current
    const plane = planeRef.current
    if (!pinEl || !track || !plane) return undefined

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

    const applyProgress = (progress: number) => {
      const { x, y, angleDeg } = sampleFlightPath(samples, progress * totalLength)
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
      const tween = gsap.to(track, {
        x: -travel,
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

  if (!geometry) {
    return <div ref={pinRef} className="h-screen w-full" />
  }

  return (
    <div ref={pinRef} className="relative h-screen w-full overflow-hidden">
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
          </defs>
          <path
            d={geometry.d}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="2 11"
            opacity={0.8}
            clipPath="url(#flight-trail-clip)"
          />
          {geometry.checkpoints.map((cp, i) => (
            <circle
              key={jobs[i].company}
              cx={cp.x}
              cy={cp.y}
              r={5}
              fill="var(--color-bg)"
              stroke="var(--color-accent)"
              strokeWidth={2}
            />
          ))}
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
            <FlightCard {...jobs[i]} />
          </div>
        ))}
      </div>
    </div>
  )
}
