import { useRef, useState } from 'react'

import { DeviceFramePreview } from '@/components/sections/Projects/DeviceFramePreview'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface Project {
  slug: string
  title: string
  tagline: string
  description: string
  stack: string[]
  links: { live?: string; github?: string }
  device: 'browser' | 'desktop' | 'mobile'
  featured: boolean
}

export function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const reducedMotion = useReducedMotion()
  const quickTo = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null)

  const ensureQuickTo = () => {
    if (!quickTo.current && previewRef.current) {
      const duration = reducedMotion ? 0 : 0.5
      quickTo.current = {
        x: gsap.quickTo(previewRef.current, 'x', { duration, ease: 'power3' }),
        y: gsap.quickTo(previewRef.current, 'y', { duration, ease: 'power3' }),
      }
    }
  }

  const moveTo = (clientX: number, clientY: number) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    ensureQuickTo()
    quickTo.current?.x(clientX - rect.left)
    quickTo.current?.y(clientY - rect.top)
  }

  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    moveTo(e.clientX, e.clientY)
    setActive(true)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    moveTo(e.clientX, e.clientY)
  }

  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    setActive(false)
  }

  const onClick = (e: React.MouseEvent) => {
    // touch devices: tap toggles the preview instead of hover
    if (window.matchMedia('(pointer: coarse)').matches) {
      e.preventDefault()
      moveTo(e.clientX, e.clientY)
      setActive((prev) => !prev)
    }
  }

  return (
    <div
      ref={cardRef}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      className="group relative overflow-hidden border-b border-border py-8 first:pt-0 last:border-none"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h3 className="font-display text-2xl font-semibold text-fg transition-colors group-hover:text-accent md:text-3xl">
          {project.title}
        </h3>
        <div className="flex gap-4 font-mono text-xs text-fg-subtle">
          {project.links.live && (
            <a href={project.links.live} className="hover:text-accent" onClick={(e) => e.stopPropagation()}>
              Live ↗
            </a>
          )}
          {project.links.github && (
            <a href={project.links.github} className="hover:text-accent" onClick={(e) => e.stopPropagation()}>
              GitHub ↗
            </a>
          )}
        </div>
      </div>
      <p className="mt-2 max-w-2xl text-fg-muted">{project.tagline}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <li key={tech} className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-fg-subtle">
            {tech}
          </li>
        ))}
      </ul>

      <div
        ref={previewRef}
        className="pointer-events-none absolute left-0 top-0 z-20 -translate-x-1/2 -translate-y-[125%] opacity-0 transition-opacity duration-200"
        style={{ opacity: active ? 1 : 0 }}
      >
        <DeviceFramePreview device={project.device} title={project.title} />
      </div>
    </div>
  )
}
