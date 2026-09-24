import memoraMac from '@/assets/memora-mac.webp'
import memoraPhone1 from '@/assets/memora-phone-1.webp'
import memoraPhone2 from '@/assets/memora-phone-2.webp'

/**
 * Memora's deep crimson, the one saturated colour in a palette that is
 * otherwise paper grey and near-black ink. The canvas takes the product's
 * own colour the way Foundr's takes its dark green.
 *
 * Not the paper grey, and not the ink, though both are more of the brand:
 * every screen in these mockups is itself light grey, so a grey canvas left
 * them with nothing to sit against, and an ink canvas would disappear into
 * this site's own near-black background on the dark theme. The crimson is
 * the only one of the three that holds in both themes and still separates
 * the devices from what is behind them.
 */
const CANVAS_CRIMSON = '#a4161a'
const DOT_COLOR = 'rgba(255, 255, 255, 0.10)'

const BOUNCE_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

const LIVE_URL = 'https://memora-learn.vercel.app/'

/**
 * Memora's screenshot showcase, built on the same bones as Foundr's: two
 * phones behind, the laptop in front, all three anchored to the canvas's
 * bottom edge and pushed down by a fraction of their own height so only part
 * of each shows at rest, the remainder cropped off by the canvas's own
 * `overflow-hidden`. On hover they lift clear of that crop line and scale up
 * with a bouncy overshoot.
 *
 * Each device has its frame baked into the asset at its own real pixel size,
 * so every container is sized to that exact aspect ratio and nothing crops
 * into the hardware, only the deliberate bottom bleed does. Memora's laptop
 * sits at a squarer ratio than Foundr's, taking in more of the base, so it
 * is given less width here to keep the same amount of phone showing either
 * side of it.
 *
 * The whole canvas is a link to the live site, the same destination as the
 * row's own "View" button.
 */
export function MemoraScreens() {
  return (
    <a
      href={LIVE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open the live Memora site"
      data-cursor-hover
      className="relative flex aspect-[10/9] w-full items-center justify-center self-start overflow-hidden rounded-2xl border border-border"
      style={{
        backgroundColor: CANVAS_CRIMSON,
        backgroundImage: `radial-gradient(${DOT_COLOR} 1px, transparent 1px)`,
        backgroundSize: '18px 18px',
      }}
    >
      <div className="group relative h-full w-full">
        {/* the study formats screen: behind, left */}
        <div
          className="absolute bottom-0 left-[2%] aspect-[380/792] w-[38%] translate-y-[12%] transition-[transform,translate,rotate,scale] duration-500 group-hover:-translate-y-6 group-hover:scale-110 group-hover:rotate-[-4deg]"
          style={{ transitionTimingFunction: BOUNCE_EASE }}
        >
          <img
            src={memoraPhone1}
            alt="Memora's study formats on mobile"
            className="h-full w-full object-contain drop-shadow-xl"
          />
        </div>
        {/* the waitlist screen: behind, right */}
        <div
          className="absolute bottom-0 right-[2%] aspect-[380/764] w-[38%] translate-y-[12%] transition-[transform,translate,rotate,scale] delay-75 duration-500 group-hover:-translate-y-6 group-hover:scale-110 group-hover:rotate-[4deg]"
          style={{ transitionTimingFunction: BOUNCE_EASE }}
        >
          <img
            src={memoraPhone2}
            alt="Memora's waitlist on mobile"
            className="h-full w-full object-contain drop-shadow-xl"
          />
        </div>
        {/* the landing page: in front, centred */}
        <div
          className="absolute bottom-0 left-1/2 aspect-[760/577] w-[80%] -translate-x-1/2 translate-y-[8%] transition-[transform,translate,rotate,scale] delay-150 duration-500 group-hover:-translate-x-1/2 group-hover:-translate-y-4 group-hover:scale-110"
          style={{ transitionTimingFunction: BOUNCE_EASE }}
        >
          <img
            src={memoraMac}
            alt="The Memora landing page on a laptop"
            className="h-full w-full object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </a>
  )
}
