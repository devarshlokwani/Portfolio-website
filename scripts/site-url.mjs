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
  return url.replace(/\/+$/, '')
}
