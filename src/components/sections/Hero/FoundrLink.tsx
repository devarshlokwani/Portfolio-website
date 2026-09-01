const FOUNDR_URL = 'https://foundr-xi.vercel.app/'

/**
 * A pill link to Foundr, in the product's own green rather than the site's
 * orange accent. A conic gradient chases continuously around the border
 * (see .foundr-pill in index.css) instead of the rainbow-border look this
 * riffs on. Rests in a dulled/muted tone; on hover the text, icon, and arrow
 * all brighten to full white together and the arrow eases a little further
 * outward.
 */
export function FoundrLink() {
  return (
    <a
      href={FOUNDR_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-hover
      className="foundr-pill group inline-flex items-center gap-2 rounded-full bg-surface/70 px-4 py-2 font-mono text-xs font-medium text-emerald-800/70 backdrop-blur-sm transition-colors duration-300 hover:text-emerald-950 dark:text-emerald-100/60 dark:hover:text-white"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-[#2c4a3d] font-accent text-[13px] font-bold text-white">
        F
      </span>
      <span>Visit Foundr</span>
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3 transition-transform duration-300 ease-out group-hover:translate-x-1"
      >
        <path d="M6 3l5 5-5 5" />
      </svg>
    </a>
  )
}
