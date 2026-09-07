# Portfolio

Devarsh Lokwani's personal site. A graduate software engineer's portfolio, built as
a single-page React app with hand-tuned motion throughout: a scroll-driven flight
path across a hand-inked panorama, a custom cursor that hands control back to the
browser when it should, and a route transition that wipes between pages.

**Live at [devarshlokwani.com](https://devarshlokwani.com).**
Setup and deployment: **[SETUP.md](SETUP.md)**.

## Stack

| | |
|---|---|
| Framework | React 19, TypeScript, Vite 8 |
| Styling | Tailwind CSS v4 |
| Motion | GSAP (ScrollTrigger, SplitText, ScrambleText, Flip), Lenis smooth scroll |
| Routing | React Router 7 |
| WebGL | ogl, for the warped hero lettering |
| Booking | Cal.com embed |
| Forms | Formspree |
| Hosting | Vercel |

## Pages

| Route | What's there |
|---|---|
| `/` | Hero, About, Skills, Projects |
| `/experience` | The work history, as a plane flying a route across a drawn landscape, one landing per job |
| `/certificates` | Every certificate, as a wall of scans or a searchable list |
| `/contact` | Cal.com booking and a message form |
| `/privacy`, `/terms` | Legal pages |

Anything else redirects to `/`. `vercel.json` rewrites all paths to `index.html` so
deep links resolve on a static host, and `www` and the project's original
`*.vercel.app` name both redirect to the apex domain.

## Layout

```
src/
  app/           providers, route transition
  components/
    sections/    one folder per page section (Hero, About, Skills, Projects,
                 Experience, Certificates, Contact, SignTheWall)
    ui/          shared pieces: Nav, Footer, SubFooter, CustomCursor, Gear, CTAs
    intro/       first-paint loader
    legal/       shared shell for the legal pages
  data/          the site's content, as JSON
  hooks/         theme, smooth scroll, reduced motion, the animation hooks
  lib/           GSAP registration, scroll helpers, Firebase
  pages/         one component per route
  styles/        theme tokens
scripts/         build-time sitemap and robots generation
```

Content lives in `src/data/*.json` and in `src/assets/`, not in components. Adding a
job, a project or a certificate is a JSON edit plus a file drop; see
[SETUP.md](SETUP.md#adding-content).

## Notable pieces

**Scroll-driven work history.** `/experience` pins and turns scroll into a paper
plane flying a wandering path across a procedurally drawn landscape, setting down at
each role. Falls back to a plain stacked list on mobile and under reduced motion.

**Custom cursor.** Replaces the native pointer, and knows when not to: it hands
control back for cross-origin iframes, the right-click menu, native drags, and for
as long as a text selection stands, so two cursors are never on screen at once.

**Route transitions.** A skewed wipe with a per-destination launch mark, which also
refreshes every ScrollTrigger on the far side so pinned sections re-measure against
the new page.

**Theme.** Dark and light, switched with a View Transition circle wipe from the
toggle itself, and applied before first paint so there is no flash of the wrong one.

**Reduced motion** is honoured throughout: every animated component checks it and
renders its settled state instead.

## Scripts

```bash
npm run dev       # dev server
npm run build     # type-check, bundle, then generate sitemap.xml and robots.txt
npm run preview   # serve the production build locally
npm run lint      # ESLint
```

`npm run build` is the whole gate. It runs `tsc -b` first, so a type error fails the
build rather than shipping.

## Sign the Wall

`src/components/sections/SignTheWall/` is a public guestbook backed by Firestore,
with rules in `firestore.rules` and App Check via reCAPTCHA v3. It is written but
not yet wired into any page, so nothing in it reaches the bundle and its environment
variables can stay empty. See [SETUP.md](SETUP.md#sign-the-wall-not-yet-live).
