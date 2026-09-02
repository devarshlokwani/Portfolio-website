import foundrMac from '@/assets/foundr-mac.png'
import foundrPhone1 from '@/assets/foundr-phone-1.png'
import foundrPhone2 from '@/assets/foundr-phone-2.png'

// Foundr's own dark-green brand tone (matches the "F" badge in FoundrLink
// and the app's own RUNWAY card) — the showcase canvas behind the device
// mockups, echoing the Huda reference's brand-colored canvas rather than
// the site's neutral surface color.
const CANVAS_GREEN = '#1f3d32'
const DOT_COLOR = 'rgba(244, 243, 239, 0.09)'

const BOUNCE_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

const LIVE_URL = 'https://foundr-xi.vercel.app/'

/**
 * Foundr's screenshot showcase — the two phone mockups sit behind, the Mac
 * mockup in front, all three anchored to the canvas's bottom edge and
 * pushed down by a fifth of their own height (`translate-y-[20%]`, a
 * self-relative percentage, unlike a positional offset which would be
 * relative to the canvas instead) so only about 80% of each device shows
 * at rest — the rest is cropped off by the canvas's own `overflow-hidden`,
 * matching the reference's "device bleeds off the bottom" look. On hover
 * they jump up well clear of that crop line and scale up with a bouncy
 * overshoot. `data-cursor-icon="foundr"` swaps the custom cursor to the
 * Foundr mark while hovering this canvas — see CustomCursor.tsx — replacing
 * the earlier rotating "explore" badge entirely. Each device already has
 * its own frame baked into the PNG (background-removed) at its own real
 * pixel size — every container is sized to that exact aspect ratio so
 * nothing crops into the frame itself, only the deliberate bottom bleed
 * does. The whole canvas is itself a link to the live site — same
 * destination as the row's own "View" button — since the cursor's "VIEW
 * MORE" ring already promises that clicking it goes somewhere.
 */
export function FoundrScreens() {
  return (
    <a
      href={LIVE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open the live Foundr site"
      data-cursor-icon="foundr"
      data-cursor-hover
      className="relative flex aspect-[10/9] w-full items-center justify-center self-start overflow-hidden rounded-2xl border border-border"
      style={{
        backgroundColor: CANVAS_GREEN,
        backgroundImage: `radial-gradient(${DOT_COLOR} 1px, transparent 1px)`,
        backgroundSize: '18px 18px',
      }}
    >
      <div className="group relative h-full w-full">
        {/* mobile dashboard — behind, left, resting 12% below the crop line */}
        <div
          className="absolute bottom-0 left-[4%] aspect-[356/701] w-[42%] translate-y-[12%] transition-transform duration-500 group-hover:-translate-y-6 group-hover:scale-110 group-hover:rotate-[-4deg]"
          style={{ transitionTimingFunction: BOUNCE_EASE }}
        >
          <img src={foundrPhone1} alt="Foundr dashboard on mobile" className="h-full w-full object-contain drop-shadow-xl" />
        </div>
        {/* mobile account view — behind, right, resting 12% below the crop line */}
        <div
          className="absolute bottom-0 right-[4%] aspect-[364/685] w-[42%] translate-y-[12%] transition-transform delay-75 duration-500 group-hover:-translate-y-6 group-hover:scale-110 group-hover:rotate-[4deg]"
          style={{ transitionTimingFunction: BOUNCE_EASE }}
        >
          <img
            src={foundrPhone2}
            alt="Foundr account menu on mobile"
            className="h-full w-full object-contain drop-shadow-xl"
          />
        </div>
        {/* laptop / landing page — in front, centered, resting 8% below the crop line */}
        <div
          className="absolute bottom-0 left-1/2 aspect-[676/369] w-[92%] -translate-x-1/2 translate-y-[8%] transition-transform delay-150 duration-500 group-hover:-translate-x-1/2 group-hover:-translate-y-4 group-hover:scale-110"
          style={{ transitionTimingFunction: BOUNCE_EASE }}
        >
          <img src={foundrMac} alt="Foundr landing page on desktop" className="h-full w-full object-contain drop-shadow-2xl" />
        </div>
      </div>
    </a>
  )
}
