import { ExperienceDetail } from '@/components/sections/Experience/ExperienceDetail'
import { FlightPath } from '@/components/sections/Experience/FlightPath'
import { Section } from '@/components/ui/Section'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import experience from '@/data/experience.json'

const HEADING = (
  <>
    <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">My Work</p>
    <h2 className="mb-14 font-display text-3xl font-semibold text-fg md:text-5xl">Where I've worked</h2>
  </>
)

/**
 * Desktop: the section pins with the heading locked at the top and further
 * scroll drives a paper plane along a wandering flight path in the space
 * below it, one checkpoint per job, see FlightPath. Reduced motion and
 * mobile (no room for a pinned horizontal scene) both fall back to the
 * same plain stacked list of full ExperienceDetail cards, with the heading
 * rendered normally above it.
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
    <Section id="experience">
      <div className="hidden md:block">
        {reducedMotion ? (
          <>
            {HEADING}
            {stackedList}
          </>
        ) : (
          <FlightPath jobs={experience} heading={HEADING} />
        )}
      </div>

      <div className="md:hidden">
        {HEADING}
        {stackedList}
      </div>
    </Section>
  )
}
