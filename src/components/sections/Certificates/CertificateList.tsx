import { LuArrowUpRight } from 'react-icons/lu'

import {
  CertificateScan,
  CredentialId,
  IssuerLine,
  Seal,
  SkillPills,
  VerifyLink,
} from '@/components/sections/Certificates/CertificateParts'
import { AccentedTitle } from '@/components/ui/AccentedTitle'
import {
  CERTIFICATES,
  hasScan,
  type Certificate,
} from '@/components/sections/Certificates/certificateData'
import { useOneOpenRow } from '@/hooks/useOneOpenRow'

/** The expanding half, below the title. */
const HALF = 'grid transition-[grid-template-rows] duration-500 ease-in-out'

/** Same inset for the title and the card's contents. */
const GUTTER = 'px-6 md:px-8'

interface RowProps {
  item: Certificate
  index: number
  open: boolean
  onOpen: () => void
  onToggle: () => void
}

/**
 * One row of the quick view, built the same way as a project row: collapsed
 * it is a title on a hairline, and hovering opens a bordered card around it.
 *
 * The title heads the card, with the running number opposite it, and
 * everything else opens beneath. Unlike the projects list this one does not
 * open upwards as well: with eleven rows the heading is what you scan down,
 * so it stays put while its row opens rather than sliding to the middle of
 * the card. Which row is open belongs to the list: see useOneOpenRow.
 *
 * A certificate with no scan on disk simply renders without one. Reserving
 * the space and leaving it empty reads as something failing to load.
 */
function Row({ item, index, open, onOpen, onToggle }: RowProps) {
  const showsScan = hasScan(item.id)
  const isTouch = () => window.matchMedia('(pointer: coarse)').matches

  return (
    <div
      className="group border-b border-border"
      onMouseEnter={() => {
        if (!isTouch()) onOpen()
      }}
    >
      <div
        className={`rounded-2xl border transition-colors duration-500 ${open ? 'border-border bg-surface/40' : 'border-transparent'}`}
      >
        <button
          type="button"
          onClick={() => {
            if (isTouch()) onToggle()
          }}
          // Keyboard users never fire mouseenter, and clicking is the touch
          // gesture, so focus is what opens a row for them.
          onFocus={() => {
            if (!isTouch()) onOpen()
          }}
          aria-expanded={open}
          data-cursor-hover
          className={`flex w-full items-center gap-4 py-6 text-left transition-[padding] duration-500 ${open ? GUTTER : 'px-0'}`}
        >
          {/* The glyph takes the accent while its row is open: the one piece of
              colour that says which of them you are on. */}
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-[transform,translate,rotate,scale,color,background-color,border-color] duration-300 ${
              open
                ? 'rotate-45 border-accent bg-accent text-accent-fg'
                : 'border-border bg-transparent text-fg'
            }`}
          >
            <LuArrowUpRight className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 font-display text-xl font-black uppercase tracking-tight text-fg md:text-3xl">
            <AccentedTitle title={item.title} />
          </span>
          {/* One slot, two things: the date while closed, the running number
              once open. The date is about to appear again in the detail below,
              and two of them on screen reads as a mistake. */}
          <span className="relative ml-auto hidden h-8 shrink-0 items-center justify-end sm:flex">
            <span
              className={`font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle transition-opacity duration-300 ${open ? 'opacity-0' : 'opacity-100'}`}
            >
              {item.issued}
            </span>
            <span
              aria-hidden={!open}
              className={`absolute right-0 flex h-8 w-8 items-center justify-center rounded-md bg-fg font-mono text-sm font-bold text-bg transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
          </span>
        </button>

        <div className={HALF} style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
          <div className="overflow-hidden">
            <div className={`${GUTTER} pb-6 md:pb-8`}>
              {showsScan && (
                // Sized so it does not tower over the projects list's frame: a
                // certificate is a wider sheet than that showcase.
                <div className="mx-auto mb-6 w-full max-w-[450px] md:mb-8">
                  <CertificateScan item={item} className="aspect-[1.41/1] w-full" />
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:gap-10">
              <div>
                <IssuerLine issuer={item.issuer} className="text-base" />
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
                  {item.issued}
                </p>
                <div className="mt-5">
                  <SkillPills skills={item.skills} />
                </div>
              </div>

              <div className="flex flex-col items-center gap-5">
                <Seal issuer={item.issuer} className="h-11 w-11" />
                <div className="flex w-full flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
                  <CredentialId value={item.credentialId} />
                  <VerifyLink url={item.url} />
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * The quick view: the whole list readable at a glance, one line each, with
 * the detail on demand. The wall is for looking at the certificates; this is
 * for finding one.
 */
export function CertificateList() {
  const { openId, aim, leave, toggle } = useOneOpenRow()

  return (
    <div className="flex flex-col" onMouseLeave={leave}>
      {CERTIFICATES.map((item, index) => (
        <Row
          key={item.id}
          item={item}
          index={index}
          open={openId === item.id}
          onOpen={() => aim(item.id)}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </div>
  )
}
