import { ExperienceDetail } from '@/components/sections/Experience/ExperienceDetail'
import { FlightPath } from '@/components/sections/Experience/FlightPath'
import { Section } from '@/components/ui/Section'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import experience from '@/data/experience.json'

/**
 * Desktop: the section pins and further scroll drives a paper plane along a
 * wandering flight path, one checkpoint per job — see FlightPath. Reduced
 * motion and mobile (no room for a pinned horizontal scene) both fall back
 * to the same plain stacked list of full ExperienceDetail cards.
 */
export function Experience() {
  const reducedMotion = useReducedMotion()

  const stackedList = (
    <div className="flex flex-col gap-8">
      {experience.map((job) => (
        <ExperienceDetail key={job.company} {...job} />
      ))}
    </div>
  )

  return (
    <Section id="experience" label="02 — Experience">
      <h2 className="mb-14 font-display text-3xl font-semibold text-fg md:text-5xl">
        Where I've worked
      </h2>

      <div className="hidden md:block">{reducedMotion ? stackedList : <FlightPath jobs={experience} />}</div>

      <div className="md:hidden">{stackedList}</div>
    </Section>
  )
}
