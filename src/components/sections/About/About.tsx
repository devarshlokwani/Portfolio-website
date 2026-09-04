import { useRef, useState } from 'react'
import { LuGraduationCap, LuLayers } from 'react-icons/lu'

import { AboutCard } from '@/components/sections/About/AboutCard'
import { ElectricConnectors } from '@/components/sections/About/ElectricConnectors'
import { PhilosophyCard } from '@/components/sections/About/PhilosophyCard'
import { Section } from '@/components/ui/Section'

const CARD = 'rounded-2xl border border-border bg-surface/60 p-6 backdrop-blur-sm md:p-8'

export function About() {
  const [hovering, setHovering] = useState(false)
  // A ref (not state) for the live cursor position — this updates on every
  // mousemove, and routing that through setState would re-render the whole
  // section every pixel of movement. ElectricConnectors reads it directly
  // off its own animation ticker instead.
  const mouseRef = useRef({ x: 0, y: 0 })

  return (
    <Section id="about" label="01 — About">
      <div
        className="flex flex-col gap-6 md:gap-0"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={(e) => {
          mouseRef.current = { x: e.clientX, y: e.clientY }
        }}
      >
        <AboutCard
          className={CARD}
          size="lg"
          icon={LuGraduationCap}
          eyebrow="Who I Am"
          title="Building,"
          subtitle="not just studying."
        >
          <p className="md:text-base">
            I'm a penultimate-year Information Technology student at Macquarie University, majoring
            in Artificial Intelligence — but most of my time goes into shipping real software, not
            just studying it. I like owning a module end to end: schema, API, UI, and the small
            details that make it feel finished.
          </p>
        </AboutCard>

        <ElectricConnectors active={hovering} mouseRef={mouseRef} />

        <div className="grid gap-6 md:grid-cols-2 md:gap-10">
          <AboutCard
            className={CARD}
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
