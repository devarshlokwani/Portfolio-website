import type { ReactNode } from 'react'

interface AppPillProps {
  href: string
  label: string
  /** The product's own mark, as a small chip at the head of the pill. */
  mark: ReactNode
  /**
   * The class carrying the chasing border, defined per product in index.css.
   * The colour the light chases in is the one thing that tells two of these
   * apart at a glance, so each product owns its own rather than sharing a
   * parameterised default.
   */
  pillClass: string
  /** Resting and hover text colour, in the product's own register. */
  toneClass: string
}

/**
 * A pill link out to one of the products, with a light chasing continuously
 * around its border.
 *
 * Shared by every product pill in the hero so they sit at identical height,
 * padding and type, which is what lets a row of them read as one set of
 * links rather than as buttons of assorted sizes. Everything that should
 * differ between them is passed in; everything that should not is here.
 *
 * Rests in a dulled tone; on hover the text, mark and arrow brighten
 * together and the arrow eases a little further outward.
 */
export function AppPill({ href, label, mark, pillClass, toneClass }: AppPillProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-hover
      className={`${pillClass} ${toneClass} group inline-flex items-center gap-2 rounded-full bg-surface/70 px-4 py-2 font-mono text-xs font-medium backdrop-blur-sm transition-colors duration-300`}
    >
      {mark}
      <span>{label}</span>
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3 transition-[transform,translate,rotate,scale] duration-300 ease-out group-hover:translate-x-1"
      >
        <path d="M6 3l5 5-5 5" />
      </svg>
    </a>
  )
}
