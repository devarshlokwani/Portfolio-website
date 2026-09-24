import type { ReactNode } from 'react'
import { LuGithub } from 'react-icons/lu'

import { Section } from '@/components/ui/Section'
import { FoundrScreens } from '@/components/sections/Projects/FoundrScreens'
import { MemoraScreens } from '@/components/sections/Projects/MemoraScreens'
import { ProjectRow } from '@/components/sections/Projects/ProjectRow'
import { BorderGlow } from '@/components/ui/BorderGlow'
import { CtaLaunchLink } from '@/components/ui/CtaLaunchLink'
import { SectionHeading } from '@/components/ui/SectionHeading'
import projectsData from '@/data/projects.json'

interface ProjectData {
  slug: string
  title: string
  description: string
  stack: string[]
  links: { live?: string; github?: string }
}

// Shown in this order. The rest of projects.json comes back once each one
// has its own assets ready, reusing this same row and showcase shell.
const VISIBLE_SLUGS = ['memora', 'foundr']

/** Each project's showcase, since every one's real assets differ. */
const SCREENS: Record<string, ReactNode> = {
  memora: <MemoraScreens />,
  foundr: <FoundrScreens />,
}

export function Projects() {
  // Ordered by VISIBLE_SLUGS rather than by the order they sit in the JSON,
  // so the running numbers follow the list above.
  const projects = VISIBLE_SLUGS.map(
    (slug) => (projectsData as ProjectData[]).find((p) => p.slug === slug)!,
  )

  return (
    <Section id="projects" label="03 / Projects">
      <SectionHeading
        title="Projects"
        mark="!"
        intro="Recent projects that solve real problems."
        action={
          <BorderGlow className="hover:!border-transparent">
            <CtaLaunchLink
              href="https://github.com/devarshlokwani"
              label="Explore More"
              icon={LuGithub}
              tone="fg"
              external
              className="rounded-full px-6 py-3 text-sm font-medium text-fg"
            />
          </BorderGlow>
        }
      />

      <div className="flex flex-col">
        {projects.map((project, i) => (
          <ProjectRow
            key={project.slug}
            project={{ index: i + 1, ...project }}
            screens={SCREENS[project.slug] ?? null}
          />
        ))}
      </div>
    </Section>
  )
}
