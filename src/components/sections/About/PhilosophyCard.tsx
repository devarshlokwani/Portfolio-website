import { LuMousePointer2 } from 'react-icons/lu'

import { AboutCard } from '@/components/sections/About/AboutCard'
import { PhilosophyTabs } from '@/components/sections/About/PhilosophyTabs'

/**
 * The About section's bottom-right card, the same shell as the other two,
 * plus the one thing they don't get: a tab row whose selection fills from
 * the bottom up.
 */
export function PhilosophyCard({ className = '' }: { className?: string }) {
  return (
    <AboutCard
      className={className}
      cog="right"
      icon={LuMousePointer2}
      eyebrow="UI Philosophy"
      title="Detail,"
      subtitle="over decoration."
      footer={
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
            Philosophy
            <span aria-hidden="true" className="text-sm leading-none">
              +
            </span>
          </div>
          <PhilosophyTabs />
        </div>
      }
    >
      <p>
        I'm most interested in the space between good engineering and good product sense: writing
        clean, maintainable code that actually solves the problem a user has.
      </p>
    </AboutCard>
  )
}
