import { useId } from 'react'

import { TechTag } from '@/components/ui/TechTag'

interface FlightCardProps {
  role: string
  company: string
  period: string
  location: string
  points: string[]
  skills: string[]
  /** small per-card tilt (degrees) so it reads as hand-placed, not laid out */
  rotation?: number
}

function WashiTape({ className = '' }: { className?: string }) {
  const patternId = useId()
  return (
    <svg viewBox="0 0 96 34" className={className} aria-hidden="true">
      <defs>
        <pattern id={patternId} width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill="#e4d9ba" />
          <rect width="3.5" height="7" fill="#d3c69f" />
        </pattern>
      </defs>
      <rect x="1" y="1" width="94" height="32" fill={`url(#${patternId})`} stroke="#b9ac86" strokeWidth="0.75" opacity="0.92" />
    </svg>
  )
}

/**
 * The widget that appears at a checkpoint along the flight path — styled
 * like a photo/note taped to a corkboard (cream paper, a slight tilt, a
 * strip of washi tape overlapping the top edge) rather than the site's
 * usual dark glass card, to match the flight path's paper-and-crayon theme.
 */
export function FlightCard({ role, company, period, location, points, skills, rotation = 0 }: FlightCardProps) {
  return (
    <div className="relative" style={{ transform: `rotate(${rotation}deg)` }}>
      <WashiTape className="absolute left-1/2 top-0 z-10 h-8 w-24 -translate-x-1/2 -translate-y-1/2 -rotate-3 drop-shadow-sm" />
      <div
        className="w-[22rem] max-w-[80vw] rounded-[2px] p-6 pt-8 shadow-2xl"
        style={{ background: '#f4ecd8', color: '#2b241c' }}
      >
        <p className="font-signature text-base tracking-normal" style={{ color: '#8a7c5e' }}>
          {period} · {location}
        </p>

        <h3 className="mt-2 font-display text-xl font-semibold">{role}</h3>
        <p className="mt-0.5 font-mono text-sm text-accent">{company}</p>

        <ul className="mt-3 flex flex-col gap-1.5 text-sm leading-relaxed" style={{ color: '#4a4235' }}>
          {points.slice(0, 2).map((point) => (
            <li key={point} className="relative pl-4 before:absolute before:left-0 before:content-['—']">
              {point}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px]"
              style={{ border: '1px solid #c9bda2', color: '#5c5245' }}
            >
              <TechTag name={skill} iconClassName="h-2.5 w-2.5 shrink-0" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
