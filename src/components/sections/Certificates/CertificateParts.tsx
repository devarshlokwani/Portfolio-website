import { LuArrowUpRight } from 'react-icons/lu'

import { gearPath } from '@/components/ui/Gear'
import { TechTag } from '@/components/ui/TechTag'
import {
  badgeMarkFor,
  markFor,
  scanFor,
  type Certificate,
} from '@/components/sections/Certificates/certificateData'
import { ACCENT_GRADIENT } from '@/components/ui/gradients'

/**
 * The seal is the site's own gear, run at a high tooth count with a shallow
 * root: the same geometry that draws the cogs behind the cards reads as the
 * scalloped edge of a wax seal once the teeth are small and numerous. One
 * shape, two jobs, rather than a second decorative primitive that happens to
 * live near the first.
 */
const SEAL = gearPath({ teeth: 18, rTip: 52, rRoot: 46, rBore: 36 })

/** The seal, stamped with the issuer's initial. Shared by both views. */
export function Seal({ issuer, className = 'h-14 w-14' }: { issuer: string; className?: string }) {
  const initial = issuer.trim().charAt(0).toUpperCase() || '?'

  return (
    <svg
      aria-hidden="true"
      viewBox="-56 -56 112 112"
      className={`shrink-0 transition-[transform,translate,rotate,scale] duration-500 group-hover:rotate-[24deg] ${className}`}
    >
      <path d={SEAL} fill="var(--color-accent)" fillRule="evenodd" />
      <text
        x="0"
        y="0"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-display"
        style={{ fontSize: 44, fontWeight: 800, fill: 'var(--color-accent)' }}
      >
        {initial}
      </text>
    </svg>
  )
}

/**
 * The issuer, shown as their logo where there is one.
 *
 * These logos are wordmarks, so the name is not printed beside them: it is
 * already in the artwork. It stays in the alt text, which is what a screen
 * reader and a failed image load both fall back to.
 */
export function IssuerLine({ issuer, className = '' }: { issuer: string; className?: string }) {
  const logo = markFor(issuer)

  if (!logo) return <p className={`text-sm text-fg-muted ${className}`}>{issuer}</p>

  return (
    <img
      src={logo}
      alt={issuer}
      // Cropped from the certificate itself, so it is black ink on
      // transparency and has to be flipped for the dark theme.
      style={{ filter: 'var(--logo-filter)' }}
      className={`h-5 w-auto max-w-[9rem] object-contain object-left opacity-90 ${className}`}
    />
  )
}

export function SkillPills({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <li
          key={skill}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-mono text-[0.7rem] text-fg-muted"
        >
          <TechTag name={skill} />
        </li>
      ))}
    </ul>
  )
}

/**
 * The certificate itself.
 *
 * A PDF goes in an `<object>` rather than an `<img>`, with pointer events
 * off so the browser's own viewer chrome cannot swallow a click meant for
 * the card underneath it. Renders nothing at all when no file has been
 * added for this certificate, which is what keeps the card from showing an
 * empty frame where a scan should be.
 */
export function CertificateScan({ item, className = '' }: { item: Certificate; className?: string }) {
  const scan = scanFor(item.id)
  const logo = badgeMarkFor(item.issuer)
  if (!scan) return null

  return (
    <a
      href={scan.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-hover
      // The cursor becomes a "VIEW MORE" badge wearing this issuer's logo,
      // the same treatment the Foundr showcase gets. It replaces the arrow
      // entirely, so there is no overlay on the artwork itself: the label
      // travels with the pointer instead of covering what it describes.
      data-cursor-icon={logo ? 'mark' : undefined}
      data-cursor-mark={logo ?? undefined}
      aria-label={`Open the ${item.title} certificate`}
      className={`group/scan relative block overflow-hidden rounded-xl border border-border bg-bg ${className}`}
    >
      {scan.previewIsPdf ? (
        <object
          data={`${scan.previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          type="application/pdf"
          aria-hidden="true"
          className="pointer-events-none h-full w-full"
        />
      ) : (
        <img
          src={scan.previewUrl}
          alt={`${item.title}, issued by ${item.issuer}`}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-[transform,translate,rotate,scale] duration-500 group-hover/scan:scale-[1.03]"
        />
      )}

    </a>
  )
}

/**
 * The code is printed exactly as issued. Verification codes are
 * case-sensitive, so the uppercase treatment the rest of these micro-labels
 * wear would turn a working code into a dead one for anyone typing it in.
 * Only the "ID" label takes it.
 */
export function CredentialId({ value }: { value: string }) {
  if (!value) {
    return (
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-fg-subtle">
        No credential ID
      </p>
    )
  }

  return (
    <p className="min-w-0 font-mono text-[0.7rem] text-fg-subtle">
      <span className="uppercase tracking-[0.15em]">ID</span>{' '}
      <span className="break-all">{value}</span>
    </p>
  )
}

export function VerifyLink({ url }: { url: string }) {
  if (!url) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-hover
      className="inline-flex shrink-0 items-center gap-1.5 font-mono text-xs uppercase tracking-[0.15em] text-fg transition-colors hover:text-accent"
    >
      Verify
      <LuArrowUpRight className="h-3.5 w-3.5" />
    </a>
  )
}

/**
 * The title with its last word in the accent gradient, the same treatment
 * the hero's tagline and the sub-footer's headlines wear.
 *
 * Splitting on the final space rather than styling a fixed word keeps it
 * working for every title in the file, from "Claude 101" to the four-word
 * job simulations, and a single-word title simply comes out fully accented.
 */
export function AccentedTitle({ title }: { title: string }) {
  const cut = title.trimEnd().lastIndexOf(' ')
  if (cut === -1) return <span style={ACCENT_GRADIENT}>{title}</span>

  return (
    <>
      {title.slice(0, cut + 1)}
      <span style={ACCENT_GRADIENT}>{title.slice(cut + 1)}</span>
    </>
  )
}
