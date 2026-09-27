import { SignatureDraw } from '@/components/sections/SignTheWall/SignatureDraw'
import { Section } from '@/components/ui/Section'
import { WallEntryForm } from '@/components/sections/SignTheWall/WallEntryForm'
import { WallEntryList } from '@/components/sections/SignTheWall/WallEntryList'

/** A centred label with a rule running out to either side. */
function Divider({ children }: { children: string }) {
  return (
    <div className="mt-24 flex items-center gap-5 md:mt-28">
      <span className="h-px flex-1 bg-border" />
      <span className="shrink-0 font-mono text-xs uppercase tracking-[0.3em] text-fg-subtle">
        {children}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

/**
 * The wall, stacked rather than split.
 *
 * It used to be a two column layout with the form on the left and the notes
 * on the right, which suited a section at the foot of the home page. On its
 * own route the two are separate beats: sign first, read the wall after, and
 * the notes get the full width to be a wall in rather than a narrow column
 * that only ever shows two of them.
 */
export function SignTheWall() {
  return (
    <Section id="wall" className="!pt-10 md:!pt-16">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-4xl font-semibold leading-tight text-fg md:text-5xl">
          Leave your
        </h2>
        {/* The word writes itself rather than being set in the serif the
            other headlines use. A page whose whole point is leaving a
            signature should show one being made. */}
        <SignatureDraw className="mx-auto mt-2 h-20 w-full max-w-[19rem] md:h-24 md:max-w-[23rem]" />
        <p className="mt-6 text-sm leading-relaxed text-fg-muted">
          Had a look around? Leave a note. What worked, what did not, what you would build
          differently, or just that you were here. Everything posted stays on the wall for the
          next person to read.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl">
        <WallEntryForm />
      </div>

      <Divider>Recent signatures</Divider>

      <div className="mt-10">
        <WallEntryList />
      </div>
    </Section>
  )
}
