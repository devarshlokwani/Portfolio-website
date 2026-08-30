import { ExploreBadge } from '@/components/sections/Projects/ExploreBadge'

/**
 * Foundr's screenshot showcase — a laptop mockup behind, two phone mockups
 * layered in front, with the rotating "explore" badge over the whole group
 * on hover.
 *
 * PLACEHOLDER: real screenshots aren't wired in yet (waiting on the actual
 * image files — see chat). This renders shaped placeholder boxes matching
 * the intended final layout so the composition can be checked now; once
 * the files land in src/assets/projects/foundr/, import them here and swap
 * each placeholder `div` for an `<img>`.
 */
export function FoundrScreens() {
  return (
    <div className="group relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface md:min-h-[360px]">
      <div className="relative flex w-full items-center justify-center px-8 py-10">
        {/* laptop / landing page — back layer */}
        <div className="aspect-[16/10] w-[78%] rounded-lg border border-border bg-bg-elevated shadow-lg" />
        {/* mobile dashboard — front left */}
        <div className="absolute bottom-4 left-[8%] aspect-[9/19] w-[26%] rounded-2xl border border-border bg-bg-elevated shadow-xl" />
        {/* mobile account view — front right */}
        <div className="absolute bottom-4 right-[8%] aspect-[9/19] w-[26%] rounded-2xl border border-border bg-bg-elevated shadow-xl" />
      </div>

      <ExploreBadge />
    </div>
  )
}
