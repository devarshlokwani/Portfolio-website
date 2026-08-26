import { Section } from '@/components/ui/Section'
import { TimelineItem } from '@/components/sections/Experience/TimelineItem'
import experience from '@/data/experience.json'

export function Experience() {
  return (
    <Section id="experience" label="02 — Experience">
      <h2 className="mb-14 font-display text-3xl font-semibold text-fg md:text-5xl">
        Where I've worked
      </h2>
      <div className="flex flex-col">
        {experience.map((job, i) => (
          <TimelineItem key={job.company} {...job} isLast={i === experience.length - 1} />
        ))}
      </div>
    </Section>
  )
}
