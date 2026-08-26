interface TimelineItemProps {
  role: string
  company: string
  period: string
  location: string
  points: string[]
  isLast?: boolean
}

export function TimelineItem({ role, company, period, location, points, isLast }: TimelineItemProps) {
  return (
    <div className="relative grid gap-4 pb-14 pl-10 last:pb-0 md:grid-cols-[220px_1fr] md:gap-10 md:pl-0">
      <div className="absolute left-0 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-accent bg-bg md:left-[220px]" />
      {!isLast && (
        <div className="absolute left-0 top-4 h-full w-px -translate-x-1/2 bg-border md:left-[220px]" />
      )}

      <div className="md:pr-10 md:text-right">
        <p className="font-mono text-xs uppercase tracking-wide text-fg-subtle">{period}</p>
        <p className="mt-1 text-sm text-fg-muted">{location}</p>
      </div>

      <div className="md:pl-10">
        <h3 className="font-display text-xl font-semibold text-fg">{role}</h3>
        <p className="mt-1 font-mono text-sm text-accent">{company}</p>
        <ul className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-fg-muted">
          {points.map((point) => (
            <li key={point} className="pl-4 relative before:absolute before:left-0 before:content-['—']">
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
