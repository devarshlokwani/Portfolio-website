# Setup

Running the site locally, adding content to it, and deploying it.

## Requirements

- **Node 20.19+ or 22.12+** (Vite 8's floor). `node -v` to check.
- npm. The repo has a `package-lock.json`, so `npm ci` gives a reproducible install.

## Running locally

```bash
npm install
cp .env.example .env     # then fill in VITE_FORMSPREE_ID, see below
npm run dev
```

The dev server prints its port; it picks the next free one from 5173 upward.

The site runs fine with an empty `.env`. Nothing crashes: the contact form reports
an error on submit, the guestbook shows its unconfigured state, and everything else
is unaffected.

## Environment variables

Copy `.env.example` to `.env`. `.env` is gitignored and never leaves your machine,
so the same values have to be set again on the host.

### `VITE_FORMSPREE_ID` — the only one the live site needs

The form ID from your Formspree endpoint. From `https://formspree.io/f/xyzabcd`,
enter **`xyzabcd`** alone, not the whole URL. Without it the contact form's submit
goes straight to its error state.

Formspree also keeps an allowed-domains list. Add the production domain there or
submissions from it are rejected even with a correct ID.

### `VITE_SITE_URL` — leave it empty

The site's own address, used for the canonical link, the Open Graph and Twitter
tags, and the URLs inside `sitemap.xml` and `robots.txt`.

Leave it blank in both places. `scripts/site-url.mjs` resolves it in this order:

1. `VITE_SITE_URL`, if set
2. `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel provides to the build
3. `http://localhost:5173`

So a Vercel build gets the real hostname on its own, and a local build gets
localhost, without either being written down. Only set it explicitly if you deploy
somewhere that isn't Vercel, or you put a custom domain in front. **Never set it to
localhost on a host** — that ships localhost URLs into your public link previews.

### The rest — leave empty

`VITE_FIREBASE_*` and `VITE_RECAPTCHA_SITE_KEY` belong to Sign the Wall, which is
not live. Nothing reads them yet.

## Adding content

The site's content is JSON plus files on disk. No component needs editing.

### Work history — `src/data/experience.json`

An array, most recent first. Each entry: `role`, `company`, `period`, `location`,
`summary`, `skills[]`, `points[]`. Every job automatically becomes a landing on the
flight path on `/experience`.

### Projects — `src/data/projects.json`

An array. Each entry: `slug`, `title`, `tagline`, `description`, `stack[]`,
`links`, `featured`, and `device` (which frame the screenshots are shown in).

### Skills — `src/data/skills.json`

Grouped under `categories`. Each item is `{ id, label, set, icon, color }`, where
`set` and `icon` name a [react-icons](https://react-icons.github.io/react-icons/)
export (`"set": "si"`, `"icon": "SiTypescript"`). Use the real brand colour; it is
what tints the icon on the globe.

### Certificates — `src/data/certificates.json` plus files

The JSON holds the text, as objects under an `items` array, most recent first:
`id`, `title`, `issuer`, `issued`, `credentialId`, `url`, `skills[]`. The images are
found on disk by filename, so a new certificate is one JSON entry and up to three
files:

| Drop it here | Named | Becomes |
|---|---|---|
| `src/assets/certificates/` | `<id>.webp` (or `.png`/`.jpg`) | the preview on the wall |
| `src/assets/certificates/` | `<id>.pdf` | the file the preview links to |
| `src/assets/certificates/logos/` | `<issuer>.<ext>` | the issuer's logo on the row |
| `src/assets/certificates/logos/marks/` | `<issuer>.<ext>` | the mark inside the hover cursor badge |

A certificate with no image renders without a preview rather than pointing at a
broken one. A PDF alone will not show a preview: rasterise its first page to an
image and drop that in alongside, named identically.

### Resume

`src/assets/resume/Devarsh_Lokwani_Resume.pdf`, imported directly by the About
section's resume card. Replacing the file is the whole update.

### Images

Save as **WebP**. Photographs and rasterised certificate pages at quality ~82;
logos and flat-colour marks lossless, since a lossy encoder rings their hard edges.
Certificate scans are 1100px wide, which covers their display size at 2×. The
certificate loader already accepts `.webp`, so no code changes when you convert.

### The link preview card — `public/og-image.jpg`

1200×630 or thereabouts; the current card is 1424×752, same 1.9:1 ratio every
platform crops to. If you replace it at a different size, update `og:image:width`
and `og:image:height` in `index.html` to match. Keep it under ~300 kB: above that,
WhatsApp and iMessage silently show no image at all.

## Deploying

Vercel, from the `main` branch. `vercel.json` already carries the SPA rewrite that
makes `/certificates` and friends resolve on a direct visit.

**On the import screen:**

| Field | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | `./` |
| Build Command | `npm run build` (the default — do not override) |
| Output Directory | `dist` |
| Install Command | `npm install` |

Do not replace the build command with `vite build`. `npm run build` chains
`tsc -b`, the bundle, and the sitemap generator; calling Vite directly skips the
type check and ships without `sitemap.xml` or `robots.txt`.

Vercel reads the nine keys in `.env.example` and offers them as environment
variables. Fill in `VITE_FORMSPREE_ID` and leave the other eight empty.

**After the first deploy:**

1. View source on the live page. `og:image` should be an absolute
   `https://…/og-image.jpg` — not localhost, and not a literal `%VITE_SITE_URL%`.
2. Type `/certificates` into the address bar rather than clicking through. This is
   the one thing local preview cannot prove: it exercises the rewrite. A 404 means
   `vercel.json` was not picked up.
3. Check `/robots.txt` and `/sitemap.xml` carry the real domain.
4. Add the domain to Formspree's allowed list, then send yourself a test message.

Link previews are cached hard. After changing the OG image, force a refresh through
LinkedIn's Post Inspector or Facebook's Sharing Debugger rather than assuming it did
not work.

## Sign the Wall (not yet live)

A public Firestore-backed guestbook, complete but not rendered by any page. To turn
it on:

1. Create a Firebase project and fill in the six `VITE_FIREBASE_*` variables.
2. Deploy `firestore.rules`. They already restrict `wallEntries` to create-only,
   with length caps on every field and a server-set `createdAt`.
3. Register the domain under **App Check → reCAPTCHA v3** and set
   `VITE_RECAPTCHA_SITE_KEY`. The collection is public-write with no auth; App Check
   is what stands between it and a bot.
4. Render `<SignTheWall />` from a page.

Until step 4, none of the Firebase code reaches the bundle — it is tree-shaken out
entirely, so leaving it dormant costs nothing.

## Notes

- **Tailwind v4** emits `translate`, `rotate` and `scale` as standalone CSS
  properties, so `transition-transform` animates nothing. Use
  `transition-[transform,translate,rotate,scale]`.
- **`npm run lint` is not part of the build.** Run it yourself before pushing.
- The dev server does not fail on lint errors, and `dist/` is gitignored.
