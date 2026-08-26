import { useMemo } from 'react'

import { Section } from '@/components/ui/Section'
import { SkillsGlobeCSS } from '@/components/sections/Skills/SkillsGlobeCSS'
import type { SkillItem } from '@/components/sections/Skills/SkillNode'
import skillsData from '@/data/skills.json'

export function Skills() {
  const { items, categories } = useMemo(() => {
    const flat: SkillItem[] = skillsData.categories.flatMap((c) => c.items as SkillItem[])
    return { items: flat, categories: skillsData.categories.map((c) => c.name) }
  }, [])

  return (
    <Section id="skills" label="03 — Skills">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-8">
        <div>
          <h2 className="font-display text-3xl font-semibold text-fg md:text-5xl">
            A toolkit built for shipping
          </h2>
          <p className="mt-6 max-w-md text-fg-muted">
            Drag the sphere to look around. Every icon here is something I've used to ship
            production code — from the language and framework layer down to the cloud and tooling
            that gets it live.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {categories.map((name) => (
              <li
                key={name}
                className="rounded-full border border-border px-3 py-1 font-mono text-xs text-fg-muted"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
        <SkillsGlobeCSS items={items} />
      </div>
    </Section>
  )
}
