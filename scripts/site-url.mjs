/**
 * Where the site lives, with no trailing slash.
 *
 * Shared by the Vite config, which substitutes it into `index.html`, and by
 * the sitemap generator, so the canonical link and the sitemap can never
 * disagree about the hostname.
 *
 * Vercel puts the production hostname in the build environment, so a
 * deployment that never sets `VITE_SITE_URL` still gets real URLs rather
 * than shipping localhost in its Open Graph tags.
 */
export function resolveSiteUrl() {
  const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const url =
    process.env.VITE_SITE_URL ||
    (fromVercel ? `https://${fromVercel}` : '') ||
    'http://localhost:5173'

  const trimmed = url.trim().replace(/\/+$/, '')

  // A bare hostname is the easy thing to type into a hosting dashboard, and
  // it fails silently and badly: without a scheme every URL built from it is
  // a relative one, so the canonical link points at a path under itself and
  // the sitemap is invalid, both of which still look fine in the markup.
  // Assuming https for a value that plainly is not a URL costs nothing and
  // removes the trap.
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}
