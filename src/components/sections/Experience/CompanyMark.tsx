interface CompanyMarkProps {
  company: string
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

/**
 * Stand-in for a real company logo (none exist as project assets yet) — a
 * monogram card in the site's own faceted/geometric visual language, so it
 * doesn't read as a broken image while there's no artwork to show.
 */
export function CompanyMark({ company }: CompanyMarkProps) {
  return (
    <div
      aria-hidden="true"
      className="flex aspect-square w-full max-w-xs items-center justify-center rounded-3xl border border-border bg-gradient-to-br from-surface to-bg shadow-lg"
    >
      <span className="font-display text-6xl font-bold text-fg-muted md:text-7xl">
        {initials(company)}
      </span>
    </div>
  )
}
