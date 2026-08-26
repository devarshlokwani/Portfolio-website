import { Section } from '@/components/ui/Section'

export function About() {
  return (
    <Section id="about" label="01 — About">
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:gap-16">
        <p className="font-display text-2xl font-medium leading-snug text-fg md:text-4xl">
          I'm a penultimate-year Information Technology student at Macquarie University, majoring
          in Artificial Intelligence — but most of my time goes into shipping real software, not
          just studying it. I like owning a module end to end: schema, API, UI, and the small
          details that make it feel finished.
        </p>
        <div className="flex flex-col gap-6 text-fg-muted">
          <p>
            I recently shipped features across a full-stack CRM as part of a 6-person Agile team,
            working from backend APIs through to the interface with React, TypeScript, and
            Node.js. Outside of that, I build my own projects end to end — from a live finance
            tracker for solo founders to relational database systems and React Native prototypes.
          </p>
          <p>
            I'm most interested in the space between good engineering and good product sense:
            writing clean, maintainable code that actually solves the problem a user has.
          </p>
        </div>
      </div>
    </Section>
  )
}
