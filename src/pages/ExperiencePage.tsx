import { Experience } from '@/components/sections/Experience/Experience'
import { ScrollCue } from '@/components/sections/Experience/ScrollCue'
import { ExperienceHero } from '@/pages/ExperienceHero'

export function ExperiencePage() {
  return (
    <main>
      <ExperienceHero />
      {/* Sits in the gap between the hero and the flight, which is exactly
          where a reader has to work out that the section below runs on
          scroll rather than sitting still. */}
      <ScrollCue />
      <Experience />
    </main>
  )
}
