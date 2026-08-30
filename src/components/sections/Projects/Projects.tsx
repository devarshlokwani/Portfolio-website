import { Section } from '@/components/ui/Section'
import { FoundrScreens } from '@/components/sections/Projects/FoundrScreens'
import { ProjectRow } from '@/components/sections/Projects/ProjectRow'
import projectsData from '@/data/projects.json'

interface ProjectData {
  slug: string
  title: string
  description: string
  stack: string[]
  links: { live?: string; github?: string }
}

// Only Foundr has real screenshots ready to show right now — the rest come
// back once their own assets are ready, reusing this same row/showcase shell.
const VISIBLE_SLUGS = ['foundr']

export function Projects() {
  const projects = (projectsData as ProjectData[]).filter((p) => VISIBLE_SLUGS.includes(p.slug))

  return (
    <Section id="projects" label="04 — Projects">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="font-display text-4xl font-black uppercase text-fg md:text-6xl">
            Projects <span className="text-accent">!</span>
          </h2>
          <p className="mt-3 max-w-md text-fg-muted">Recent projects that solve real problems.</p>
        </div>
        <a
          href="https://github.com/devarshlokwani"
          target="_blank"
          rel="noopener noreferrer"
          data-cursor-hover
          className="rounded-full border border-border px-6 py-3 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent"
        >
          Explore More
        </a>
      </div>

      <div className="flex flex-col">
        {projects.map((project, i) => (
          <ProjectRow
            key={project.slug}
            project={{ index: i + 1, ...project }}
            screens={project.slug === 'foundr' ? <FoundrScreens /> : null}
            defaultOpen={projects.length === 1}
          />
        ))}
      </div>
    </Section>
  )
}
