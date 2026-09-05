import { TechTag } from '@/components/ui/TechTag'

interface ExperienceDetailProps {
  role: string
  company: string
  period: string
  location: string
  points: string[]
  skills: string[]
}

/**
 * The "widget" card: role, company, full bullet list, and the skills used,
 * always shown, no hover-expand (that made the card's height shift while it
 * was sitting sticky against the scrolling company column, which read as
 * janky rather than satisfying). Used both as the sticky left panel on
 * desktop and as a plain stacked card on mobile.
 */
export function ExperienceDetail({ role, company, period, location, points, skills }: ExperienceDetailProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-6 backdrop-blur-sm md:p-8">
      <p className="font-mono text-xs uppercase tracking-wide text-fg-subtle">{period}</p>
      <p className="mt-1 text-sm text-fg-muted">{location}</p>

      <h3 className="mt-4 font-display text-2xl font-semibold text-fg md:text-3xl">{role}</h3>
      <p className="mt-1 font-mono text-sm text-accent">{company}</p>

      <ul className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-fg-muted">
        {points.map((point) => (
          <li
            key={point}
            className="relative pl-4 before:absolute before:left-0 before:content-['•']"
          >
            {point}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-mono text-[11px] text-fg-muted"
          >
            <TechTag name={skill} />
          </span>
        ))}
      </div>
    </div>
  )
}
