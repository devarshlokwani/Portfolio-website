import { TECH_ICONS } from '@/components/ui/techIcons'

interface TechTagProps {
  name: string
  iconClassName?: string
}

/**
 * The icon + label content for a skill/stack pill — the brand icon in
 * front of the name instead of plain text. Renders just the content (no
 * wrapping element), so each call site keeps its own pill chrome (`<li>` or
 * `<span>`, border/padding/size/colors) and just adds `inline-flex
 * items-center gap-1.5` to lay the icon and label out side by side. Falls
 * back to a label-only render for entries with no real brand mark (a job's
 * skills list mixes in things like "Content Strategy" alongside actual
 * tools) — used everywhere a list of tools/technologies shows up (project
 * stacks, job skills).
 */
export function TechTag({ name, iconClassName = 'h-3 w-3 shrink-0' }: TechTagProps) {
  const entry = TECH_ICONS[name]
  const Icon = entry?.icon

  return (
    <>
      {Icon && <Icon className={iconClassName} style={{ color: entry.color }} />}
      {name}
    </>
  )
}
