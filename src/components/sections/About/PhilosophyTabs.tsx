import { useRef, useState } from 'react'

import { FillPill } from '@/components/ui/FillPill'
import { gsap } from '@/lib/gsap'

interface PhilosophyTab {
  id: string
  label: string
  heading: string
  detail: string
}

const TABS: PhilosophyTab[] = [
  {
    id: 'intent',
    label: 'Intent',
    heading: 'Every move earns its place',
    detail: 'If an animation can\'t tell you what just changed, it shouldn\'t be there.',
  },
  {
    id: 'rhythm',
    label: 'Rhythm',
    heading: 'Tuned, not defaulted',
    detail: 'Durations and curves get adjusted until they feel right in the hand.',
  },
  {
    id: 'restraint',
    label: 'Restraint',
    heading: 'The quiet decision',
    detail: 'Knowing where to leave things still is half of knowing how to move them.',
  },
  {
    id: 'edges',
    label: 'Edges',
    heading: 'The states nobody asks for',
    detail: 'Empty, loading, error, mid-transition — designed, not left to chance.',
  },
]

/**
 * The tab row and its detail panel for the philosophy card. Single accent
 * color throughout (no per-tab hue); the bottom-up fill on selection lives
 * in FillPill, shared with the Skills category filter.
 */
export function PhilosophyTabs() {
  const [activeId, setActiveId] = useState(TABS[0].id)
  const panelRef = useRef<HTMLDivElement>(null)
  const active = TABS.find((t) => t.id === activeId) ?? TABS[0]

  const selectTab = (id: string) => {
    if (id === activeId) return
    setActiveId(id)
    const panel = panelRef.current
    if (panel) gsap.fromTo(panel, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' })
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <li key={tab.id}>
            <FillPill
              active={tab.id === activeId}
              onClick={() => selectTab(tab.id)}
              className="px-3.5 py-1.5"
            >
              {tab.label}
            </FillPill>
          </li>
        ))}
      </ul>

      <div ref={panelRef}>
        <p className="font-display text-sm font-semibold text-fg">{active.heading}</p>
        <p className="mt-1 text-sm leading-relaxed text-fg-muted">{active.detail}</p>
      </div>
    </div>
  )
}
