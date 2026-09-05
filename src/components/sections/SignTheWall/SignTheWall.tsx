import { Section } from '@/components/ui/Section'
import { WallEntryForm } from '@/components/sections/SignTheWall/WallEntryForm'
import { WallEntryList } from '@/components/sections/SignTheWall/WallEntryList'

export function SignTheWall() {
  return (
    <Section id="wall" label="05 / Sign the Wall">
      <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:gap-16">
        <div>
          <h2 className="font-display text-3xl font-semibold text-fg md:text-5xl">
            Leave your mark
          </h2>
          <p className="mt-6 max-w-sm text-fg-muted">
            Scrolled this far? Sign the wall: say hi, leave feedback, or just prove you made it
            to the bottom.
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
