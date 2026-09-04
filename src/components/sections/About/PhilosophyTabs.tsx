import { useRef, useState } from 'react'

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

const FILL_DURATION = 0.5
// power2.inOut reads as slow-fast-slow — the fill eases into motion,
// races through the middle, then eases back out as it reaches the top,
// rather than growing at a flat constant rate.
const FILL_EASE = 'power2.inOut'

/**
 * The tab row and its detail panel for the philosophy card. Single accent
 * color throughout (no per-tab hue): the selected tab's fill is a solid
 * orange panel that grows from the bottom edge up to cover the pill, and
 * the previously-selected tab's fill retreats the same way in reverse,
 * both on the same eased curve.
 */
export function PhilosophyTabs() {
  const [activeId, setActiveId] = useState(TABS[0].id)
  const panelRef = useRef<HTMLDivElement>(null)
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([])
  const active = TABS.find((t) => t.id === activeId) ?? TABS[0]

  const selectTab = (id: string) => {
    if (id === activeId) return
    const prevIndex = TABS.findIndex((t) => t.id === activeId)
    const nextIndex = TABS.findIndex((t) => t.id === id)
    setActiveId(id)

    const prevFill = fillRefs.current[prevIndex]
    const nextFill = fillRefs.current[nextIndex]
    if (prevFill) gsap.to(prevFill, { scaleY: 0, duration: FILL_DURATION, ease: FILL_EASE })
    if (nextFill) gsap.fromTo(nextFill, { scaleY: 0 }, { scaleY: 1, duration: FILL_DURATION, ease: FILL_EASE })

    const panel = panelRef.current
    if (panel) gsap.fromTo(panel, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' })
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-wrap gap-2">
        {TABS.map((tab, i) => {
          const isActive = tab.id === activeId
          return (
            <li key={tab.id}>
              <button
                type="button"
                data-cursor-hover
                onClick={() => selectTab(tab.id)}
                aria-pressed={isActive}
                className={`group relative isolate overflow-hidden rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors duration-300 ${
                  isActive ? 'border-accent' : 'border-border hover:border-accent'
                }`}
              >
                <span
                  ref={(el) => {
                    fillRefs.current[i] = el
                  }}
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 origin-bottom bg-accent"
                  style={{ transform: `scaleY(${isActive ? 1 : 0})` }}
                />
                <span
                  className={`transition-colors duration-300 ${
                    isActive ? 'text-accent-fg' : 'text-fg-muted group-hover:text-accent'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div ref={panelRef}>
        <p className="font-display text-sm font-semibold text-fg">{active.heading}</p>
        <p className="mt-1 text-sm leading-relaxed text-fg-muted">{active.detail}</p>
      </div>
    </div>
  )
}
