import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { CompanyMark } from '@/components/sections/Experience/CompanyMark'
import { ExperienceDetail } from '@/components/sections/Experience/ExperienceDetail'
import { Section } from '@/components/ui/Section'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import experience from '@/data/experience.json'

/**
 * Desktop: the left panel sticks in place (plain CSS `position: sticky`,
 * not scroll-jacked) while the right column's company slots scroll past —
 * an IntersectionObserver (same scroll-spy pattern as the nav) tracks which
 * slot is centered and swaps the left panel's content to match. A thin rail
 * between the two columns tracks overall scroll progress through the right
 * column with a "DL" marker, sliding top-to-bottom via a plain scrubbed
 * (non-pinning) ScrollTrigger tween. Mobile collapses to a simple stacked
 * list since there's no second column for any of that to play off.
 */
export function Experience() {
  const [activeIndex, setActiveIndex] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  const railColumnRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)
  const prevIndex = useRef(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const idx = slotRefs.current.findIndex((el) => el === entry.target)
          if (idx !== -1) setActiveIndex(idx)
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    slotRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (activeIndex === prevIndex.current) return
    prevIndex.current = activeIndex
    const panel = panelRef.current
    if (!panel) return

    if (reducedMotion) return
    gsap.fromTo(panel, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
  }, [activeIndex, reducedMotion])

  useLayoutEffect(() => {
    if (reducedMotion) return
    const marker = markerRef.current
    const rightColumn = railColumnRef.current
    if (!marker || !rightColumn) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        marker,
        { top: '0%' },
        {
          top: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: rightColumn,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
          },
        },
      )
    })

    return () => ctx.revert()
  }, [reducedMotion])

  const activeJob = experience[activeIndex]

  return (
    <Section id="experience" label="02 — Experience">
      <h2 className="mb-14 font-display text-3xl font-semibold text-fg md:text-5xl">
        Where I've worked
      </h2>

      {/* Desktop: sticky-left / rail / scrolling-right */}
      <div className="hidden md:grid md:grid-cols-[1fr_56px_1fr] md:gap-8">
        <div ref={panelRef} className="md:sticky md:top-28 md:self-start">
          <ExperienceDetail {...activeJob} />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
          <div
            ref={markerRef}
            aria-hidden="true"
            className="absolute left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent bg-bg font-mono text-xs font-semibold text-fg shadow-lg"
          >
            DL
          </div>
        </div>

        <div ref={railColumnRef} className="flex flex-col gap-24">
          {experience.map((job, i) => (
            <div
              key={job.company}
              ref={(el) => {
                slotRefs.current[i] = el
              }}
              className="flex min-h-[70vh] items-center justify-center"
            >
              <CompanyMark company={job.company} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: plain stacked cards, no sticky panel or rail to play off */}
      <div className="flex flex-col gap-8 md:hidden">
        {experience.map((job) => (
          <ExperienceDetail key={job.company} {...job} />
        ))}
      </div>
    </Section>
  )
}
