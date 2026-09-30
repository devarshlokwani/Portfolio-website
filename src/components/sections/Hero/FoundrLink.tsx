import { AppPill } from '@/components/sections/Hero/AppPill'

const FOUNDR_URL = 'https://foundr-xi.vercel.app/'

/**
 * A pill link to Foundr, in the product's own green rather than the site's
 * orange accent. A conic gradient chases continuously around the border
 * (see .foundr-pill in index.css) instead of the rainbow-border look this
 * riffs on.
 */
export function FoundrLink() {
  return (
    <AppPill
      href={FOUNDR_URL}
      label="Visit Foundr"
      pillClass="foundr-pill"
      toneClass="text-emerald-800/70 hover:text-emerald-950 dark:text-emerald-100/60 dark:hover:text-white"
      mark={
        <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-[#2c4a3d] font-accent text-[13px] font-bold text-white">
          F
        </span>
      }
    />
  )
}
