interface FlightCardProps {
  role: string
  company: string
  period: string
  location: string
  points: string[]
  skills: string[]
}

/**
 * The widget that appears at a checkpoint along the flight path — a
 * condensed take on ExperienceDetail (top two bullets only, not the full
 * list), sized to float as a compact card rather than sit as a dense
 * sticky panel.
 */
export function FlightCard({ role, company, period, location, points, skills }: FlightCardProps) {
  return (
    <div className="w-[22rem] max-w-[80vw] rounded-2xl border border-border bg-surface/80 p-6 shadow-2xl backdrop-blur-md">
      <p className="font-mono text-[11px] uppercase tracking-wide text-fg-subtle">
        {period} · {location}
      </p>

      <h3 className="mt-3 font-display text-xl font-semibold text-fg">{role}</h3>
      <p className="mt-0.5 font-mono text-sm text-accent">{company}</p>

      <ul className="mt-3 flex flex-col gap-1.5 text-sm leading-relaxed text-fg-muted">
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
            className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] text-fg-muted"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
}
