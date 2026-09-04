import { LuGraduationCap, LuLayers } from 'react-icons/lu'

import { AboutCard } from '@/components/sections/About/AboutCard'
import { PhilosophyCard } from '@/components/sections/About/PhilosophyCard'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'

// Fully opaque, not the translucent surface it used to be: the cogs sit
// behind these cards, and anything less than solid leaves their buried half
// showing through as a ghost instead of genuinely disappearing under the
// card. (`backdrop-blur` went with it — there's nothing to see through now.)
//
const CARD = 'rounded-2xl border border-border bg-surface p-6 md:p-8'

export function About() {
  return (
    <Section id="about" label="01 — About">
      <SectionHeading title="About" />

      {/* The gap used to be supplied by the connector row that lived between
          these two blocks; with that gone, it's a real gap. */}
      <div className="flex flex-col gap-6 md:gap-20">
        <AboutCard
          className={CARD}
          size="lg"
          cog="top"
          icon={LuGraduationCap}
          eyebrow="Who I Am"
          title="Graduated,"
          subtitle="already shipping."
        >
          <p className="md:text-base">
            I graduated from Macquarie University this July with a degree in Information
            Technology, majoring in Artificial Intelligence — though most of my time there went
            into shipping real software, not just studying it. I like owning a module end to end:
            schema, API, UI, and the small details that make it feel finished.
          </p>
        </AboutCard>

        <div className="grid gap-6 md:grid-cols-2 md:gap-10">
          <AboutCard
            className={CARD}
            cog="left"
            icon={LuLayers}
            eyebrow="What I've Shipped"
            title="Full-stack,"
            subtitle="end to end."
          >
            <p>
              I recently shipped features across a full-stack CRM as part of a 6-person Agile team,
              working from backend APIs through to the interface with Django, Python, and
              PostgreSQL. Outside of that, I build my own projects end to end — from a live finance
              tracker for solo founders to relational database systems and React Native prototypes.
            </p>
          </AboutCard>

          <PhilosophyCard className={CARD} />
        </div>
      </div>
    </Section>
  )
}
