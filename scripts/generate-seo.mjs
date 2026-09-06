import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { resolveSiteUrl } from './site-url.mjs'

/**
 * Writes robots.txt and sitemap.xml into the build output.
 *
 * Generated rather than committed under `public/`, because files there are
 * copied through verbatim: a sitemap has to carry absolute URLs, and one
 * typed by hand goes stale the moment the site moves to its own domain.
 * Built here, the whole thing follows a single environment variable.
 */
const SITE = resolveSiteUrl()

/**
 * The routes in `App.tsx` that are real pages. The catch-all redirect is not
 * one, and neither are the in-page hash links on the home route.
 *
 * `priority` is a hint, not a ranking: the home page first, the two pages a
 * recruiter is actually being sent to next, then the legal pages last.
 */
const ROUTES = [
  { path: '/', priority: '1.0' },
  { path: '/experience', priority: '0.9' },
  { path: '/certificates', priority: '0.8' },
  { path: '/contact', priority: '0.8' },
  { path: '/privacy', priority: '0.3' },
  { path: '/terms', priority: '0.3' },
]

const today = new Date().toISOString().slice(0, 10)

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(
  ({ path, priority }) => `  <url>
    <loc>${SITE}${path}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`,
).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
await writeFile(`${dist}sitemap.xml`, sitemap)
await writeFile(`${dist}robots.txt`, robots)

console.log(`seo: wrote sitemap.xml and robots.txt for ${SITE}`)
