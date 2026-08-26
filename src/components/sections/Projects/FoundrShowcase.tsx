import { useEffect, useRef } from 'react'

import type { Project } from '@/components/sections/Projects/ProjectCard'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const BARS = [45, 80, 60, 95, 70, 55, 88, 62]

export function FoundrShowcase({ project }: { project: Project }) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([])
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    barsRef.current.forEach((bar, i) => {
      if (!bar) return
      tl.to(
        bar,
        { scaleY: 0.55 + Math.random() * 0.5, duration: 1.6, ease: 'sine.inOut' },
        i * 0.08,
      )
    })

    return () => {
      tl.kill()
    }
  }, [reducedMotion])

  return (
    <div className="mb-16 grid gap-8 rounded-2xl border border-border bg-bg-elevated p-6 md:grid-cols-2 md:gap-12 md:p-10">
      <div className="flex flex-col justify-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Flagship Project</p>
        <h3 className="mt-3 font-display text-3xl font-semibold text-fg md:text-4xl">
          {project.title}
        </h3>
        <p className="mt-4 text-fg-muted">{project.description}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-fg-subtle"
            >
              {tech}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex gap-4 font-mono text-xs">
          {project.links.live && (
            <a href={project.links.live} className="text-accent hover:underline">
              View live ↗
            </a>
          )}
          {project.links.github && (
            <a href={project.links.github} className="text-fg-muted hover:text-fg">
              Source ↗
            </a>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-bg shadow-2xl">
        <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 rounded-full bg-surface px-2 py-0.5 font-mono text-[9px] text-fg-subtle">
            foundr.dev
          </span>
        </div>
        <div className="flex h-56 gap-2 p-3">
          <div className="flex w-10 flex-col gap-2 rounded-md bg-surface p-1.5">
            <div className="h-2 w-full rounded-sm bg-accent/70" />
            <div className="h-2 w-full rounded-sm bg-fg-subtle/30" />
            <div className="h-2 w-full rounded-sm bg-fg-subtle/30" />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              {['Burn rate', 'Runway', 'Margin'].map((label) => (
                <div key={label} className="rounded-md bg-surface p-2">
                  <div className="h-1 w-2/3 rounded-full bg-fg-subtle/40" />
                  <div className="mt-2 h-2.5 w-1/2 rounded-full bg-accent/80" />
                </div>
              ))}
            </div>
            <div className="flex flex-1 items-end gap-1.5 rounded-md bg-surface p-3">
              {BARS.map((h, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    barsRef.current[i] = el
                  }}
                  className="flex-1 origin-bottom rounded-t-sm bg-accent/70"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
