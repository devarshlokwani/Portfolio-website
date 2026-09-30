import type { ReactNode } from 'react'
import { LuArrowUpRight, LuGithub } from 'react-icons/lu'

import { BorderGlow } from '@/components/ui/BorderGlow'
import { CtaLaunchLink } from '@/components/ui/CtaLaunchLink'
import { TechTag } from '@/components/ui/TechTag'

export interface ProjectEntry {
  index: number
  slug: string
  title: string
  description: string
  stack: string[]
  links: { live?: string; github?: string }
}

interface ProjectRowProps {
  project: ProjectEntry
  /** the screenshot showcase for the expanded state, a component-per-project since each one's real assets differ */
  screens: ReactNode
  open: boolean
  /**
   * Hover or keyboard focus asking for this row. The list owns which one is
   * open, because only it can close the one that was.
   */
  onOpen: () => void
  /** tap toggles, for touch, where there is no hover to open with */
  onToggle: () => void
}

/** Both halves open and close together, so they are set up identically. */
const HALF = 'grid transition-[grid-template-rows] duration-500 ease-in-out'

/** Same inset for the title and the card's contents. */
const GUTTER = 'px-6 md:px-8'

/**
 * One row in the projects list: collapsed, it's just a title with a small
 * arrow-in-box glyph, separated by a hairline, no border box, matching a
 * plain list. Hovering the row (mouse) opens a bordered, rounded card around
 * that title. Touch devices (no real hover) get tap-to-toggle instead.
 * grid-template-rows animates 0fr→1fr so the expansion is a smooth height
 * tween without measuring pixels in JS.
 *
 * The card opens in both directions from the title rather than only
 * downwards, which is what keeps the list from shifting as far when one row
 * hands over to another.
 *
 * Whichever way it opens, something moves: opening a row pushes its own
 * title down by whatever sits above it, and swapping rows moves the next
 * title up by whatever sits below. Those two distances add up to the card's
 * height no matter how it is divided, so the worst of the two is smallest
 * when the halves match. Keep them roughly even. Piling the content into one
 * end buys nothing; it only decides which of the two moves is the bad one.
 *
 * Which row is open belongs to the list, not to the row: see Projects. A row
 * does not close itself when the pointer leaves, because that is what made
 * the list unusable downwards.
 */
export function ProjectRow({ project, screens, open, onOpen, onToggle }: ProjectRowProps) {
  const isTouch = () => window.matchMedia('(pointer: coarse)').matches

  return (
    <div
      className="border-b border-border"
      onMouseEnter={() => {
        if (!isTouch()) onOpen()
      }}
    >
      <div
        className={`rounded-2xl border transition-colors duration-500 ${open ? 'border-border bg-surface/40' : 'border-transparent'}`}
      >
        {/* Above the title: the showcase, centred and held short of the card's
            own edges so it reads as a framed picture rather than a banner
            filling the width. */}
        <div className={HALF} style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
          <div className="overflow-hidden">
            <div className={`${GUTTER} pt-6 md:pt-8`}>
              <div className="mx-auto w-full max-w-[640px]">{screens}</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isTouch()) onToggle()
          }}
          // Keyboard users never fire mouseenter, and clicking is the touch
          // gesture, so focus is what opens a row for them.
          onFocus={() => {
            if (!isTouch()) onOpen()
          }}
          aria-expanded={open}
          data-cursor-hover
          // The inset arrives with the card, so the title is flush with the
          // rest of the list while closed and sits inside the card's padding
          // once it is not.
          className={`flex w-full items-center gap-4 py-6 text-left transition-[padding] duration-500 ${open ? GUTTER : 'px-0'}`}
        >
          {/* The glyph takes the accent while its row is open: the one piece of
              colour that says which of them you are on, in the orange the rest
              of the page already uses. */}
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-[transform,translate,rotate,scale,color,background-color,border-color] duration-300 ${
              open ? 'rotate-45 border-accent bg-accent text-accent-fg' : 'border-border bg-transparent text-fg'
            }`}
          >
            <LuArrowUpRight className="h-4 w-4" />
          </span>
          <span className="font-display text-2xl font-black uppercase tracking-tight text-fg md:text-4xl">
            {project.title}
          </span>
          <span
            className={`ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-fg font-mono text-sm font-bold text-bg transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={!open}
          >
            {String(project.index).padStart(2, '0')}
          </span>
        </button>

        {/* Below the title: everything you read, in two columns so this half
            stays about as tall as the one above it. */}
        <div className={HALF} style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
          <div className="overflow-hidden">
            <div className={`grid gap-6 ${GUTTER} pb-6 md:grid-cols-[1.4fr_1fr] md:gap-10 md:pb-8`}>
              <p className="text-fg-muted">{project.description}</p>

              <div>
                <ul className="flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <li
                      key={tech}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-fg-subtle"
                    >
                      <TechTag name={tech} />
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-3">
                  {project.links.github && (
                    <BorderGlow className="hover:!border-transparent">
                      <CtaLaunchLink
                        href={project.links.github}
                        label="GitHub"
                        icon={LuGithub}
                        tone="fg"
                        external
                        className="rounded-full px-5 py-2.5 text-sm font-medium text-fg"
                      />
                    </BorderGlow>
                  )}
                  {project.links.live && (
                    <CtaLaunchLink
                      href={project.links.live}
                      label="View"
                      external
                      className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-[transform,translate,rotate,scale] hover:-translate-y-0.5"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
