import { LuGraduationCap, LuLayers } from 'react-icons/lu'

import { AboutCard } from '@/components/sections/About/AboutCard'
import { PhilosophyCard } from '@/components/sections/About/PhilosophyCard'
import { ResumeCard } from '@/components/sections/About/ResumeCard'
import { CornerCog } from '@/components/ui/CornerCog'
import { cardSheen } from '@/components/ui/gradients'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'

// Fully opaque, not the translucent surface it used to be: the cogs sit
// behind these cards, and anything less than solid leaves their buried half
// showing through as a ghost instead of genuinely disappearing under the
// card. (`backdrop-blur` went with it: there's nothing to see through now.)
//
const CARD = 'rounded-2xl border border-border bg-surface p-6 md:p-8'

/**
 * The same lift the sub-footer's cards wear, measured from this card's own
 * ground rather than the page's: flat `surface` read as a slab next to them.
 * Held to 8 rather than the sub-footer's 10, because `surface` starts higher
 * than the page colour and the same step off it lands too pale.
 */
const CARD_SURFACE = cardSheen('var(--color-surface)', 8)

/**
 * A gear anchored to the bottom edge of one block, dropped far enough to sit
 * centred in the space below it rather than on the edge itself.
 *
 * Half its own height puts the centre on the edge; the extra 2.5rem is half
 * of the `md:gap-20` between the blocks. Gears only exist from `md` up, so
 * the tighter mobile gap never comes into it.
 */
const IN_GAP_BELOW = 'bottom-0 translate-y-[calc(50%_+_2.5rem)]'

/**
 * Larger than the gears that used to hang off a card's outer edge. Only the
 * strip falling in the gap is ever visible now, and at the old size that
 * strip was a fragment too small to read as a gear at all.
 */
const COG_SIZE = 'h-56 w-56 lg:h-64 lg:w-64'

/** The layer the gears sit on: behind the cards, and never in the way of a
 *  click. */
const COG_LAYER = 'pointer-events-none absolute inset-0'

export function About() {
  return (
    <Section id="about" label="01 / About">
      <SectionHeading title="About" />

      {/* The gap used to be supplied by the connector row that lived between
          these two blocks; with that gone, it's a real gap, and the gears
          live in it.

          They sit in the two horizontal spaces between the cards rather than
          hanging off the outside of them: each is a sibling painted before
          the cards around it, so their own opaque surfaces bury everything
          except the band that falls in the gap. That is the sub-footer's
          trick, turned from the gutters of a row to the spaces in a column,
          and it reads as one mechanism running behind the section instead of
          four ornaments pinned to its edges.

          A pair in each gap, counter-rotating so the two read as meshed
          rather than as two loose parts drifting the same way. The upper
          pair sits on the thirds and the lower one outside it, near the two
          edges, so no gear sits directly under another and the four read as
          one mechanism stepping outward down the section rather than as two
          identical rows. */}
      <div className="flex flex-col gap-6 md:gap-20">
        <div className="relative">
          <div aria-hidden="true" className={COG_LAYER}>
            <CornerCog
              placement="left"
              anchor={`left-1/3 -translate-x-1/2 ${IN_GAP_BELOW}`}
              className={COG_SIZE}
            />
            <CornerCog
              placement="right"
              anchor={`left-2/3 -translate-x-1/2 ${IN_GAP_BELOW}`}
              className={COG_SIZE}
            />
          </div>

          <AboutCard
            className={CARD}
            style={CARD_SURFACE}
            size="lg"
            icon={LuGraduationCap}
            eyebrow="Who I Am"
            title="Graduated,"
            subtitle="already shipping."
          >
            <p className="md:text-base">
              I graduated from Macquarie University this July with a degree in Information
              Technology, majoring in Artificial Intelligence. Most of my time there went
              into shipping real software, not just studying it. I like owning a module end to end:
              schema, API, UI, and the small details that make it feel finished.
            </p>
          </AboutCard>
        </div>

        <div className="relative">
          {/* The pair in the space under this row, before the resume card.
              Set wider than the pair above, out near the edges, and spinning
              the opposite way round to it. */}
          <div aria-hidden="true" className={COG_LAYER}>
            <CornerCog
              placement="right"
              anchor={`left-[16.7%] -translate-x-1/2 ${IN_GAP_BELOW}`}
              className={COG_SIZE}
            />
            <CornerCog
              placement="left"
              anchor={`left-[83.3%] -translate-x-1/2 ${IN_GAP_BELOW}`}
              className={COG_SIZE}
            />
          </div>

          {/* `relative`, so the pair paints above the gear layer rather than
              under it: an absolutely positioned sibling otherwise wins over
              an in-flow one whatever the order. */}
          <div className="relative grid gap-6 md:grid-cols-2 md:gap-10">
            <AboutCard
              className={CARD}
              style={CARD_SURFACE}
              icon={LuLayers}
              eyebrow="What I've Shipped"
              title="Full-stack,"
              subtitle="end to end."
            >
              <p>
                I recently shipped features across a full-stack CRM as part of a 6-person Agile
                team, working from backend APIs through to the interface with Django, Python, and
                PostgreSQL. Outside of that, I build my own projects end to end, from a live
                finance tracker for solo founders to relational database systems and React Native
                prototypes.
              </p>
            </AboutCard>

            <PhilosophyCard className={CARD} style={CARD_SURFACE} />
          </div>
        </div>

        {/* Full width under the pair, so it closes the section rather than
            reading as a third card in that row. It buries the bottom of the
            gear in the gap above it. */}
        <ResumeCard className={CARD} style={CARD_SURFACE} />
      </div>
    </Section>
  )
}
