import type { ReactNode } from 'react'

interface SectionHeadingProps {
  /** rendered in caps by the type styles — pass it in normal case */
  title: string
  /** the accent punctuation that closes the title */
  mark?: string
  /** one line under the title; omitted where a section has nothing to add */
  intro?: ReactNode
  /** right-aligned control on the same row, e.g. Projects' "Explore More" */
  action?: ReactNode
}

/**
 * The big display heading that opens a home-page section.
 *
 * Extracted from Projects, which was the only section wearing it, so About
 * and Skills can carry the same treatment without three copies of the type
 * stack drifting apart. `items-end` is what keeps an optional action button
 * sitting on the heading's baseline rather than floating at the top of a
 * two-line block.
 */
export function SectionHeading({ title, mark = '.', intro, action }: SectionHeadingProps) {
  return (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
      <div>
        <h2 className="font-display text-4xl font-black uppercase text-fg md:text-6xl">
          {title} {mark && <span className="text-accent">{mark}</span>}
        </h2>
        {intro && <p className="mt-3 max-w-md text-fg-muted">{intro}</p>}
      </div>
      {action}
    </div>
  )
}
