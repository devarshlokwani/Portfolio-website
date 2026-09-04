import { useMemo, useState } from 'react'

import { FillPill } from '@/components/ui/FillPill'
import { Section } from '@/components/ui/Section'
import { SkillsGlobeCSS } from '@/components/sections/Skills/SkillsGlobeCSS'
import type { SkillItem } from '@/components/sections/Skills/SkillNode'
import skillsData from '@/data/skills.json'

export function Skills() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const { items, categories } = useMemo(() => {
    const flat: SkillItem[] = skillsData.categories.flatMap((c) =>
      c.items.map((item) => ({ ...item, category: c.name }) as SkillItem),
    )
    return { items: flat, categories: skillsData.categories.map((c) => c.name) }
  }, [])

  const toggleCategory = (name: string) => {
    setActiveCategory((prev) => (prev === name ? null : name))
  }

  return (
    <Section id="skills" label="03 — Skills">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-8">
        <div>
          <h2 className="font-display text-3xl font-semibold text-fg md:text-5xl">
            A toolkit built for shipping
          </h2>
          <p className="mt-6 max-w-md text-fg-muted">
            Drag the sphere to look around, or tap a category to spotlight just those skills.
            Every icon here is something I've used to ship production code.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {categories.map((name) => (
              <li key={name}>
                <FillPill
                  active={activeCategory === name}
                  onClick={() => toggleCategory(name)}
                  className="px-3 py-1"
                >
                  {name}
                </FillPill>
              </li>
            ))}
          </ul>
        </div>
        <SkillsGlobeCSS items={items} activeCategory={activeCategory} />
      </div>
    </Section>
  )
}
