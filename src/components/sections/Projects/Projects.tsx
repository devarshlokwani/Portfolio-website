import { LuGithub } from 'react-icons/lu'

import { Section } from '@/components/ui/Section'
import { FoundrScreens } from '@/components/sections/Projects/FoundrScreens'
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

// Only Foundr has real screenshots ready to show right now, the rest come
// back once their own assets are ready, reusing this same row/showcase shell.
const VISIBLE_SLUGS = ['foundr']

export function Projects() {
  const projects = (projectsData as ProjectData[]).filter((p) => VISIBLE_SLUGS.includes(p.slug))

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
            screens={project.slug === 'foundr' ? <FoundrScreens /> : null}
          />
        ))}
      </div>
    </Section>
  )
}
