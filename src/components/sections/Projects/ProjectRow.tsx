import { useState, type ReactNode } from 'react'
import { LuArrowUpRight, LuGithub } from 'react-icons/lu'

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
  /** the screenshot showcase for the expanded state — a component-per-project since each one's real assets differ */
  screens: ReactNode
  defaultOpen?: boolean
}

/**
 * One row in the projects list: collapsed, it's just a title with a small
 * arrow-in-box glyph, separated by a hairline — no border box, matching a
 * plain list. Hovering the row (mouse) expands it in place into a bordered,
 * rounded card revealing the numbered badge, description, stack/links, and
 * the project's own screenshot showcase; moving off collapses it again.
 * Touch devices (no real hover) get tap-to-toggle instead. grid-template-
 * rows animates 0fr→1fr so the expansion is a smooth height tween without
 * measuring pixels in JS.
 */
export function ProjectRow({ project, screens, defaultOpen = false }: ProjectRowProps) {
  const [open, setOpen] = useState(defaultOpen)

  const isTouch = () => window.matchMedia('(pointer: coarse)').matches

  return (
    <div
      className="border-b border-border"
      onMouseEnter={() => !isTouch() && setOpen(true)}
      onMouseLeave={() => !isTouch() && setOpen(false)}
    >
      <button
        type="button"
        onClick={() => isTouch() && setOpen((prev) => !prev)}
        aria-expanded={open}
        data-cursor-hover
        className="flex w-full items-center gap-4 py-6 text-left"
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-fg transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
        >
          <LuArrowUpRight className="h-4 w-4" />
        </span>
        <span className="font-display text-2xl font-black uppercase tracking-tight text-fg md:text-4xl">
          {project.title}
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-500 ease-in-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div
            className={`rounded-2xl border p-6 transition-colors duration-500 md:p-8 ${open ? 'border-border bg-surface/40' : 'border-transparent'}`}
          >
            <div className="grid gap-8 md:grid-cols-2 md:gap-12">
              <div>
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-fg font-mono text-sm font-bold text-bg">
                  {String(project.index).padStart(2, '0')}
                </span>
                <p className="mt-5 max-w-md text-fg-muted">{project.description}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <li
                      key={tech}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-fg-subtle"
                    >
                      <TechTag name={tech} />
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  {project.links.github && (
                    <CtaLaunchLink
                      href={project.links.github}
                      label="GitHub"
                      icon={LuGithub}
                      tone="fg"
                      external
                      className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent"
                    />
                  )}
                  {project.links.live && (
                    <CtaLaunchLink
                      href={project.links.live}
                      label="View"
                      external
                      className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-transform hover:-translate-y-0.5"
                    />
                  )}
                </div>
              </div>

              {screens}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
