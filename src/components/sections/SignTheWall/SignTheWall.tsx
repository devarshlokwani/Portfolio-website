import { Section } from '@/components/ui/Section'
import { WallEntryForm } from '@/components/sections/SignTheWall/WallEntryForm'
import { WallEntryList } from '@/components/sections/SignTheWall/WallEntryList'

export function SignTheWall() {
  return (
    <Section id="wall">
      <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:gap-16">
        <div>
          <h2 className="font-display text-3xl font-semibold text-fg md:text-5xl">
            Leave your mark
          </h2>
          {/* Written for a page someone arrives at rather than scrolls to.
              The old line opened with "Scrolled this far?", which was true
              when this sat at the foot of the home page and is not true of
              anyone who followed a link straight here. */}
          <p className="mt-6 max-w-sm text-fg-muted">
            Had a look around? Leave a note. What worked, what did not, what you would build
            differently, or just that you were here. Everything posted stays on the wall for the
            next person to read.
          </p>
          <div className="mt-8">
            <WallEntryForm />
          </div>
        </div>
        <div className="max-h-[520px] overflow-y-auto pr-1">
          <WallEntryList />
        </div>
      </div>
    </Section>
  )
}
