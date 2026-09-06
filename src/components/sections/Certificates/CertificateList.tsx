import { useState } from 'react'
import { LuArrowUpRight } from 'react-icons/lu'

import {
  AccentedTitle,
  CertificateScan,
  CredentialId,
  IssuerLine,
  Seal,
  SkillPills,
  VerifyLink,
} from '@/components/sections/Certificates/CertificateParts'
import {
  CERTIFICATES,
  hasScan,
  type Certificate,
} from '@/components/sections/Certificates/certificateData'

/**
 * One row of the quick view, built the same way as a project row: collapsed
 * it is a title on a hairline, and hovering expands it in place into a
 * bordered card with the detail and the certificate itself.
 *
 * `grid-template-rows` animates 0fr to 1fr, so the expansion is a real
 * height tween without measuring pixels in JS. Touch devices have no hover
 * to work with, so there it toggles on tap instead.
 */
function Row({ item, index }: { item: Certificate; index: number }) {
  const [open, setOpen] = useState(false)
  // Only split the panel in two when there is a certificate to put in the
  // second half. Otherwise the detail sits in a narrow column beside an
  // empty one, which reads as something failing to load.
  const showsScan = hasScan(item.id)

  const isTouch = () => window.matchMedia('(pointer: coarse)').matches

  return (
    <div
      className="group border-b border-border"
      onMouseEnter={() => !isTouch() && setOpen(true)}
      onMouseLeave={() => !isTouch() && setOpen(false)}
    >
      <button
        type="button"
        onClick={() => isTouch() && setOpen((prev) => !prev)}
        aria-expanded={open}
        data-cursor-hover
        className="flex w-full items-center gap-4 py-6 text-left"
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-fg transition-[transform,translate,rotate,scale] duration-300 ${
            open ? 'rotate-45' : ''
          }`}
        >
          <LuArrowUpRight className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 font-display text-xl font-black uppercase tracking-tight text-fg md:text-3xl">
          <AccentedTitle title={item.title} />
        </span>
        {/* Drops away as the row opens: the same date is about to appear in
            the detail below, and two of them on screen reads as a mistake. */}
        <span
          className={`hidden shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle transition-opacity duration-300 sm:block ${
            open ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {item.issued}
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-500 ease-in-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div
            className={`rounded-2xl border p-6 transition-colors duration-500 md:p-8 ${
              open ? 'border-border bg-surface/40' : 'border-transparent'
            }`}
          >
            <div className={`grid gap-8 md:gap-12 ${showsScan ? 'md:grid-cols-2' : ''}`}>
              <div>
                <div className="flex items-center gap-4">
                  <Seal issuer={item.issuer} className="h-11 w-11" />
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-fg font-mono text-sm font-bold text-bg">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <IssuerLine issuer={item.issuer} className="mt-5 text-base" />
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
                  {item.issued}
                </p>

                <div className="mt-5">
                  <SkillPills skills={item.skills} />
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
                  <CredentialId value={item.credentialId} />
                  <VerifyLink url={item.url} />
                </div>
              </div>

              <CertificateScan item={item} className="aspect-[1.41/1] w-full" />
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
  return (
    <div className="flex flex-col">
      {CERTIFICATES.map((item, index) => (
        <Row key={item.id} item={item} index={index} />
      ))}
    </div>
  )
}
