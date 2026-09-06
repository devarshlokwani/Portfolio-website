import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { LuDownload, LuMail } from 'react-icons/lu'

import { GearBadge } from '@/components/sections/About/GearBadge'
import { BorderGlow } from '@/components/ui/BorderGlow'
import { CtaLaunchLink } from '@/components/ui/CtaLaunchLink'
import { ACCENT_GRADIENT } from '@/components/ui/gradients'
import resumeUrl from '@/assets/resume/Devarsh_Lokwani_Resume.pdf'

const EMAIL = 'devarshlokwani480@gmail.com'

/** What the file is called once it lands in someone's downloads folder. */
const FILE_NAME = 'Devarsh-Lokwani-Resume.pdf'

/** How long the confirmation under the address stays up. */
const COPIED_MS = 2400

/**
 * A real circle, sized in pixels rather than percentages.
 *
 * A percentage-sized ellipse takes the card's own proportions, and this card
 * is nearly three times wider than it is tall: the ring came out stretched
 * so flat that its arc read as a diagonal smear rather than a curve. Fixed
 * dimensions keep it round whatever the card does, and it is smaller on
 * narrow screens where the card turns tall and a large circle would swamp
 * it.
 */
const ARC =
  'pointer-events-none absolute right-[-130px] top-[-300px] h-[440px] w-[440px] rounded-full md:right-[-180px] md:top-[-420px] md:h-[620px] md:w-[620px]'

/**
 * The accent ring that lights the top-right corner.
 *
 * The same trick the sub-footer's work card uses, turned to come in from the
 * opposite corner: an ellipse far larger than the card, bordered rather than
 * filled, positioned so only one crown of it crosses the frame. A filled
 * shape would wash the whole corner; a ring leaves darkness on both sides of
 * the arc for it to read against.
 *
 * Two of them: a wide soft one for the bloom and a thin sharper one riding
 * on top, so the light has an edge instead of being an even smudge. Both
 * drift toward the card and brighten on hover.
 */
function CornerArc() {
  return (
    <>
      <span
        aria-hidden="true"
        className={`${ARC} opacity-50 blur-xl transition-all duration-700 ease-out group-hover:right-[-150px] group-hover:top-[-395px] group-hover:opacity-100`}
        style={{ border: '26px solid var(--color-accent)' }}
      />
      <span
        aria-hidden="true"
        className={`${ARC} opacity-30 blur-md transition-all duration-700 ease-out group-hover:right-[-150px] group-hover:top-[-395px] group-hover:opacity-95`}
        style={{ border: '6px solid var(--color-accent)' }}
      />
    </>
  )
}

/**
 * The closing card of the About section: the two things a recruiter reading
 * this far actually wants, the resume and an address to reply to.
 *
 * It runs full width under the pair of cards above it, so it reads as the
 * end of the section rather than a third item in the row.
 */
export function ResumeCard({
  className = '',
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  const [copied, setCopied] = useState(false)
  // The whole card is the hover target for the badge's machinery, not the
  // badge itself: it is a forty-four pixel mark reacting to the card being
  // read, so the card is what should wake it.
  const [hovered, setHovered] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  /** Opens a URL the way a link click would, without navigating this page. */
  const follow = (href: string, download?: string) => {
    const link = document.createElement('a')
    link.href = href
    if (download) link.download = download
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  /**
   * Copies the address *and* opens a message to it.
   *
   * Copying alone left the reader to go and find their mail client; opening
   * alone is no use to anyone whose mail lives in a browser tab rather than
   * behind a `mailto:` handler. Doing both means the click works whichever
   * way they read their mail.
   */
  const contact = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), COPIED_MS)
    } catch {
      // Clipboard access can be refused (an insecure origin, or a gesture the
      // browser did not trust). The address is on screen either way, and the
      // mail client still opens, so there is nothing to recover from beyond
      // not claiming it was copied.
    }
    follow(`mailto:${EMAIL}`)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={style}
      className={`group relative overflow-hidden ${className}`}
    >
      <CornerArc />

      {/* Above the arc: it is painted first so everything here sits on it. */}
      <div className="relative flex items-start justify-between gap-4">
        <GearBadge active={hovered} />

        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg px-3.5 py-1.5 text-xs font-medium text-fg">
          {/* Two circles: a steady dot with a larger one pulsing out from
              underneath it, so the status reads as live rather than printed.
              Both take the theme's own foreground, white on the dark theme
              and black on the light one, rather than a green that belongs to
              no other part of the palette. */}
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fg opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-fg" />
          </span>
          Available for work
        </span>
      </div>

      <h3 className="relative mt-7 font-display text-2xl font-black uppercase leading-[0.95] text-fg md:text-4xl">
        Want the full picture
        <br />
        <span className="font-accent text-2xl lowercase italic md:text-4xl" style={ACCENT_GRADIENT}>
          take it with you.
        </span>
      </h3>

      <div className="relative mt-8 border-t border-border pt-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="min-w-0">
            {/* The accent one, because writing is the thing this card is
                actually asking for. The resume is the alternative, so it
                takes the quieter outline. */}
            <CtaLaunchLink
              href={`mailto:${EMAIL}`}
              label={EMAIL}
              icon={LuMail}
              onNavigate={contact}
              // `inline-flex`, because this one is not a flex item: the link is an
              // anchor, and left inline its background broke into fragments
              // around the text instead of drawing one pill.
              className="inline-flex items-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-fg transition-[transform,translate,rotate,scale] hover:-translate-y-0.5 md:text-base"
            />
            <p
              role="status"
              className="mt-3 pl-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-fg-subtle"
            >
              {copied ? 'Copied, opening your mail' : 'Tap to email or copy'}
            </p>
          </div>

          <BorderGlow className="shrink-0 self-start hover:!border-transparent md:self-auto">
            <CtaLaunchLink
              href={resumeUrl}
              label="Download Resume"
              icon={LuDownload}
              tone="fg"
              onNavigate={() => follow(resumeUrl, FILE_NAME)}
              className="rounded-full px-6 py-3 text-sm font-medium text-fg"
            />
          </BorderGlow>
        </div>
      </div>
    </div>
  )
}
