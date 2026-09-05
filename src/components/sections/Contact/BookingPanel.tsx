import { useEffect, useRef, useState } from 'react'
import Cal, { getCalApi } from '@calcom/embed-react'
import { LuChevronDown } from 'react-icons/lu'

import portrait from '@/assets/portrait.jpg'
import { CogLoader } from '@/components/ui/CogLoader'
import { useTheme } from '@/hooks/useTheme'

/** Public Cal.com handle, alongside the GitHub and LinkedIn links the site
 *  already hardcodes. */
const CAL_USER = 'devarsh-lokwani-ggqkrm'

/** Event slugs as they exist on Cal.com. */
const DURATIONS = [
  { slug: '15min', label: '15 Min Meeting' },
  { slug: '30min', label: '30 Min Meeting' },
]

/**
 * The site's own palette, handed to Cal so the calendar paints itself on the
 * page's background instead of its own near-black. Cal's default `#111111`
 * against this page's `#0a0a0c` was what made the embed read as a panel sunk
 * into the section, the "extra container" that no amount of removing wrappers
 * on this side could get rid of.
 *
 * Values mirror theme.css. They have to be literals: Cal renders in a
 * cross-origin frame, so a `var(--color-bg)` would resolve against the
 * frame's own document, where the site's variables do not exist.
 */
const CAL_VARS = {
  dark: {
    'cal-bg': '#0a0a0c',
    'cal-bg-emphasis': '#17171c',
    'cal-bg-subtle': '#121216',
    'cal-bg-muted': '#0a0a0c',
    'cal-border': '#26262e',
    'cal-border-subtle': '#26262e',
    'cal-border-emphasis': '#3a3a45',
    'cal-text': '#f4f3ef',
    'cal-text-emphasis': '#f4f3ef',
    'cal-text-subtle': '#a3a1ab',
    'cal-text-muted': '#6f6d78',
    'cal-brand': '#ff5a3c',
    'cal-brand-text': '#0a0a0c',
    'cal-brand-emphasis': '#ff5a3c',
  },
  light: {
    'cal-bg': '#f7f5f0',
    'cal-bg-emphasis': '#ffffff',
    'cal-bg-subtle': '#ffffff',
    'cal-bg-muted': '#f7f5f0',
    'cal-border': '#e4e0d6',
    'cal-border-subtle': '#e4e0d6',
    'cal-border-emphasis': '#cbc6b9',
    'cal-text': '#17161a',
    'cal-text-emphasis': '#17161a',
    'cal-text-subtle': '#55525c',
    'cal-text-muted': '#8a8790',
    'cal-brand': '#d94a2f',
    'cal-brand-text': '#ffffff',
    'cal-brand-emphasis': '#d94a2f',
  },
}

/**
 * A listbox rather than a native `<select>`. The native control renders the
 * operating system's own menu, which arrives as a white list in the middle
 * of a dark page and takes the browser's focus ring with it. Neither can be
 * styled, so the menu is built here instead.
 */
function DurationPicker({
  slug,
  onChange,
}: {
  slug: string
  onChange: (slug: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const active = DURATIONS.find((d) => d.slug === slug) ?? DURATIONS[0]

  useEffect(() => {
    if (!open) return undefined
    const onDocDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        data-cursor-hover
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        // Neutral on hover rather than the accent border used elsewhere: an
        // orange ring around a calendar control reads as a validation error.
        // focus-visible keeps a ring for keyboard users without painting one
        // on every mouse click.
        className="inline-flex items-center gap-2.5 rounded-full border border-border bg-surface py-3 pl-5 pr-4 text-sm font-medium text-fg outline-none transition-colors duration-300 hover:border-fg-subtle focus-visible:border-fg"
      >
        {active.label}
        <LuChevronDown
          className={`h-4 w-4 text-fg-muted transition-[transform,translate,rotate,scale] duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Meeting length"
          className="absolute right-0 top-full z-20 mt-2 w-max min-w-full overflow-hidden rounded-2xl border border-border bg-surface p-1 shadow-2xl shadow-black/40"
        >
          {DURATIONS.map((d) => {
            const on = d.slug === slug
            return (
              <li key={d.slug}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  data-cursor-hover
                  onClick={() => {
                    onChange(d.slug)
                    setOpen(false)
                  }}
                  className={`block w-full whitespace-nowrap rounded-full px-5 py-2.5 text-left text-sm transition-colors duration-200 ${
                    on ? 'bg-fg text-bg' : 'text-fg-muted hover:bg-bg hover:text-fg'
                  }`}
                >
                  {d.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/** What the loader reserves before any calendar has ever been measured. */
const MIN_EMBED_HEIGHT = 560

export function BookingPanel() {
  const { theme } = useTheme()
  const [slug, setSlug] = useState(DURATIONS[0].slug)
  const [ready, setReady] = useState(false)
  // The theme whose palette Cal has already been handed. The embed below is
  // held back until this matches, because Cal reads its UI config once when
  // the frame boots: mounting first and configuring after left every reload
  // wearing the *previous* theme's colours.
  const [configured, setConfigured] = useState<string | null>(null)

  // The height the loaded calendar last occupied. Switching duration tears
  // the embed down and rebuilds it, and without this the section would
  // collapse to the loader's own height and drag the whole page below it up
  // for the second or two the reload takes.
  const embedRef = useRef<HTMLDivElement>(null)
  const [heldHeight, setHeldHeight] = useState(MIN_EMBED_HEIGHT)

  useEffect(() => {
    const el = embedRef.current
    if (!el || !ready) return undefined
    const observer = new ResizeObserver(() => {
      const h = el.getBoundingClientRect().height
      if (h > 0) setHeldHeight(h)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ready, slug])

  // Cal's official embed rather than a bare iframe. It is what exposes the
  // three things a plain frame could not do: the palette above, the details
  // panel (Cal's own copy of the title, length and timezone, which this page
  // already states in its header), and height, which it reports back as the
  // calendar reflows instead of needing a fixed guess that leaves dead space
  // at some widths and clips at others.
  //
  // Registered once. Re-running this per theme would stack a fresh pair of
  // listeners on every toggle, since Cal has no way to remove one.
  useEffect(() => {
    let cancelled = false

    getCalApi({ namespace: theme })
      .then((cal) => {
        if (cancelled) return
        cal('on', { action: 'linkReady', callback: () => setReady(true) })
        // A dead link would otherwise sit behind the loader forever. Showing
        // the frame lets Cal display its own error rather than pretending the
        // page is still loading.
        cal('on', { action: 'linkFailed', callback: () => setReady(true) })
      })
      .catch(() => {
        if (!cancelled) setReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [theme])

  // Theme is applied before each mount rather than pushed into a live embed:
  // Cal reads it when the frame boots and does not repaint an already-running
  // calendar, so the embed is keyed on it below and rebuilds instead.
  useEffect(() => {
    let cancelled = false
    setReady(false)
    setConfigured(null)

    // A namespace per theme. Cal applies a namespace's UI config once, when
    // its first frame boots, and ignores later calls on the same one, so
    // re-configuring the default namespace left the light calendar wearing
    // the dark palette's body colour.
    getCalApi({ namespace: theme })
      .then((cal) => {
        if (cancelled) return
        cal('ui', {
          theme,
          // Cal's own document forces `color-scheme: dark` and leaves its
          // html and body transparent, so on the light theme the browser
          // painted the frame's canvas black behind the calendar: a slab
          // the size of the embed that no styling on this side could cover.
          // Naming the scheme and the body background fills it with the
          // page's own colour instead.
          colorScheme: theme,
          styles: { body: { background: CAL_VARS[theme]['cal-bg'] } },
          cssVarsPerTheme: CAL_VARS,
          hideEventTypeDetails: true,
        })
        setConfigured(theme)
      })
      .catch(() => {
        if (cancelled) return
        // Better a calendar in the wrong palette than no calendar: let it
        // mount unconfigured rather than leaving the loader spinning.
        setConfigured(theme)
        setReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [theme])

  // Each slug is a separate Cal link and reloads from scratch, so the wait
  // comes back every time the picker changes, not just on first paint.
  const choose = (next: string) => {
    if (next === slug) return
    setReady(false)
    setSlug(next)
  }

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={portrait}
            alt=""
            className="h-14 w-14 shrink-0 rounded-full object-cover"
          />
          <div>
            <p className="text-base font-medium text-fg">Devarsh Lokwani</p>
            <p className="mt-0.5 font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
              Pick a time that suits you
            </p>
          </div>
        </div>

        <DurationPicker slug={slug} onChange={choose} />
      </div>

      {/* No wrapper card, and no fixed height. The embed sizes itself and now
          paints on the page's own background, so what is left on screen is
          the calendar alone. The loader is stacked in the same grid cell
          rather than positioned absolutely, so it reserves height while the
          embed has none to report yet. */}
      <div className="grid" style={{ minHeight: ready ? undefined : heldHeight }}>
        <div
          ref={embedRef}
          className={`col-start-1 row-start-1 transition-opacity duration-500 ${
            ready ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          {configured === theme && (
            <Cal
              key={`${slug}-${theme}`}
              namespace={theme}
              calLink={`${CAL_USER}/${slug}`}
              config={{ layout: 'month_view', theme }}
              style={{ width: '100%' }}
            />
          )}
        </div>

        {!ready && (
          <div className="col-start-1 row-start-1 flex items-center justify-center">
            <CogLoader label="Loading calendar" />
          </div>
        )}
      </div>
    </div>
  )
}
