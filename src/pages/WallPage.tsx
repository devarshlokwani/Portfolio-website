import { SignTheWall } from '@/components/sections/SignTheWall/SignTheWall'
import { WallHero } from '@/pages/WallHero'

/**
 * Its own route rather than a section at the foot of Home.
 *
 * A wall of notes only reads as a wall once there are enough of them to fill
 * one, and buried under everything else on the home page it would be seen by
 * whoever scrolled furthest rather than by whoever came to leave something.
 * On its own route it has an address that can be linked to directly, which
 * is what makes it usable as somewhere to point people.
 */
export function WallPage() {
  return (
    <main>
      <WallHero />
      <SignTheWall />
    </main>
  )
}
