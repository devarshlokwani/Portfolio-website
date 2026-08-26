import { Section } from '@/components/ui/Section'
import { FoundrShowcase } from '@/components/sections/Projects/FoundrShowcase'
import { ProjectCard, type Project } from '@/components/sections/Projects/ProjectCard'
import projectsData from '@/data/projects.json'

export function Projects() {
  const projects = projectsData as Project[]
  const featured = projects.find((p) => p.featured)
  const rest = projects.filter((p) => p !== featured)

  return (
    <Section id="projects" label="04 — Projects">
      <h2 className="mb-12 font-display text-3xl font-semibold text-fg md:text-5xl">
        Things I've built
      </h2>

      {featured && <FoundrShowcase project={featured} />}

      <div className="flex flex-col">
        {rest.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </Section>
  )
}
