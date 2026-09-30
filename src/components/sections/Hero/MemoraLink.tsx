import memoraMark from '@/assets/memora-mark.webp'
import { AppPill } from '@/components/sections/Hero/AppPill'

const MEMORA_URL = 'https://memora-learn.vercel.app/'

/**
 * A pill link to Memora, beside Foundr's.
 *
 * Its chase runs in the theme's own foreground rather than in a brand
 * colour: white on the dark page, black on the light one. Foundr's green
 * already owns the pill next to it, and a second coloured ring had the two
 * reading as one set of controls rather than as two separate products. See
 * .memora-pill in index.css for the colours themselves.
 *
 * The mark sits on the pill itself with nothing behind it. It is black line
 * art on transparent, which reads on the light page but would be a
 * brain-shaped hole on the dark one, so it carries `--logo-filter`: the same
 * token the certificate logos use to invert for the dark theme, rather than
 * a second copy of the artwork.
 */
export function MemoraLink() {
  return (
    <AppPill
      href={MEMORA_URL}
      label="Visit Memora"
      pillClass="memora-pill"
      toneClass="text-fg-muted hover:text-fg"
      mark={
        <img
          src={memoraMark}
          alt=""
          style={{ filter: 'var(--logo-filter)' }}
          className="h-[18px] w-[18px] object-contain"
        />
      }
    />
  )
}
