import type { CSSProperties } from 'react'

import {
  CertificateScan,
  CredentialId,
  IssuerLine,
  Seal,
  SkillPills,
  VerifyLink,
} from '@/components/sections/Certificates/CertificateParts'
import { CERTIFICATES, type Certificate } from '@/components/sections/Certificates/certificateData'
import { AccentedTitle } from '@/components/ui/AccentedTitle'
import { useScrollReveal } from '@/hooks/useScrollReveal'

/**
 * Near-black rather than a lifted grey, matching the sub-footer cards: a
 * panel visibly paler than the page reads as a box pasted on top of it,
 * where these should look set into the wall.
 */
const FRAME: CSSProperties = {
  backgroundImage:
    'linear-gradient(160deg, color-mix(in srgb, var(--color-fg) 5%, transparent), transparent 55%)',
}

function Plaque({ item }: { item: Certificate }) {
  return (
    <article
      data-cursor-hover
      style={FRAME}
      className="group flex h-full flex-col rounded-2xl border border-border bg-bg-elevated p-6 transition-[transform,translate,rotate,scale,border-color] duration-300 hover:-translate-y-1 hover:border-fg-subtle md:p-7"
    >
      {/* Landscape, the shape every one of these certificates is printed
          in. Nothing renders here until a file exists for this row, so the
          card never shows an empty frame. */}
      <CertificateScan item={item} className="mb-6 aspect-[1.41/1] w-full" />

      <div className="flex items-start justify-between gap-4">
        <Seal issuer={item.issuer} />
        <p className="pt-1 text-right font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
          {item.issued}
        </p>
      </div>

      <h3 className="mt-6 font-display text-xl font-semibold leading-snug text-fg md:text-2xl">
        <AccentedTitle title={item.title} />
      </h3>
      <IssuerLine issuer={item.issuer} className="mt-2" />

      <div className="mt-5">
        <SkillPills skills={item.skills} />
      </div>

      {/* Pushed to the bottom so the rule lines up across a row of plaques
          whatever length the titles above it run to. */}
      <div className="mt-auto flex items-end justify-between gap-4 border-t border-border pt-5">
        <CredentialId value={item.credentialId} />
        <VerifyLink url={item.url} />
      </div>
    </article>
  )
}

/**
 * The wall: every certificate as a framed plaque, all of them on screen at
 * once.
 *
 * The middle column is dropped by a fixed offset on wide screens, which is
 * what separates a wall from a table. A perfectly aligned grid of identical
 * rectangles reads as a spreadsheet no matter how the cells are styled.
 */
export function CertificateWall() {
  const gridRef = useScrollReveal<HTMLDivElement>({ y: 28, stagger: '[data-plaque]' })

  return (
    <div ref={gridRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {CERTIFICATES.map((item, index) => (
        <div key={item.id} data-plaque className={index % 3 === 1 ? 'lg:mt-12' : ''}>
          <Plaque item={item} />
        </div>
      ))}
    </div>
  )
}
