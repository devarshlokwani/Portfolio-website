import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

import { resolveSiteUrl } from './scripts/site-url.mjs'

/**
 * Fills `%VITE_SITE_URL%` in `index.html` with the site's real address.
 *
 * Vite can substitute env placeholders in HTML on its own, but only from a
 * variable that is actually set: a build that forgets it ships the literal
 * `%VITE_SITE_URL%` inside its Open Graph tags, which is a silent and
 * embarrassing way to fail. Doing it here means the same fallback the
 * sitemap uses applies to the markup, so there is always a real URL.
 */
function siteUrl(): Plugin {
  return {
    name: 'site-url',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replaceAll('%VITE_SITE_URL%', resolveSiteUrl()),
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrl()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
