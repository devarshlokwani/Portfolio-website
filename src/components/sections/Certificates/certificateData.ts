import data from '@/data/certificates.json'

export interface Certificate {
  id: string
  title: string
  issuer: string
  issued: string
  credentialId: string
  /** the issuer's public verification page, empty where there isn't one */
  url: string
  skills: string[]
}

export const CERTIFICATES = data.items as Certificate[]

/**
 * The certificate itself, and the issuer's logo, are both picked up from
 * disk rather than listed in the JSON.
 *
 * A file dropped into `src/assets/certificates/` named after a
 * certificate's `id` becomes that certificate's scan; one dropped into
 * `logos/` named after its issuer becomes that issuer's mark. Nothing else
 * needs editing, and a certificate with no file simply renders without a
 * preview instead of pointing at a broken image.
 */
const SCANS = import.meta.glob('/src/assets/certificates/*.{png,jpg,jpeg,webp,pdf}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const MARK_FILES = import.meta.glob('/src/assets/certificates/logos/marks/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const LOGO_FILES = import.meta.glob('/src/assets/certificates/logos/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

/** `/src/assets/certificates/aws-bedrock.pdf` -> `aws-bedrock` */
function basename(path: string) {
  return path.split('/').pop()?.replace(/\.[^.]+$/, '') ?? ''
}

const byName = (files: Record<string, string>) =>
  Object.fromEntries(Object.entries(files).map(([path, url]) => [basename(path), url]))

const LOGO_BY_SLUG = byName(LOGO_FILES)
const MARK_BY_SLUG = byName(MARK_FILES)

/** Both files an id may have, keyed by that id. */
const SCANS_BY_ID: Record<string, { pdf?: string; image?: string } | undefined> = {}
for (const [path, url] of Object.entries(SCANS)) {
  const id = basename(path)
  const entry = (SCANS_BY_ID[id] ??= {})
  if (/\.pdf$/i.test(path)) entry.pdf = url
  else entry.image = url
}

export interface Scan {
  /** what the card shows: always an image where one exists */
  previewUrl: string
  /** whether that preview has to go in an <object> rather than an <img> */
  previewIsPdf: boolean
  /** what opens when it is clicked: the PDF, so the reader gets the real document */
  fileUrl: string
}

const isPdf = (url: string) => /\.pdf(\?|$)/i.test(url)

/**
 * A certificate can have both a PDF and an image, and they are used for
 * different things.
 *
 * Ten PDFs on the wall at once means ten instances of the browser's own
 * viewer, which is slow enough that most of them simply never paint, so the
 * preview always prefers an image. The PDF stays as what opens on click,
 * since that is the actual document worth handing someone.
 */
export function scanFor(id: string): Scan | null {
  const files = SCANS_BY_ID[id]
  if (!files) return null

  const previewUrl = files.image ?? files.pdf
  const fileUrl = files.pdf ?? files.image
  if (!previewUrl || !fileUrl) return null

  return { previewUrl, previewIsPdf: isPdf(previewUrl), fileUrl }
}

export function hasScan(id: string) {
  return Boolean(SCANS_BY_ID[id])
}

/** "AWS Training & Certification" -> "aws-training-certification" */
export function issuerSlug(issuer: string) {
  return issuer
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * The issuer's logo, cropped from their own certificate.
 *
 * Every one of these is a wordmark carrying the issuer's name, so wherever
 * one is shown the name is not repeated beside it. Printing "Citi" next to
 * a logo that already reads "citi" was the tell that the two were being
 * treated as decoration plus label rather than as the same thing.
 */
export function markFor(issuer: string): string | null {
  return LOGO_BY_SLUG[issuerSlug(issuer)] ?? null
}

/**
 * The logo for the cursor badge, where a wordmark has nowhere to go.
 *
 * The badge's centre is a circle roughly sixty pixels across. A wordmark
 * three times wider than it is tall has to shrink to about a third of that
 * height to fit, which is what made Anthropic's unreadable. A square symbol
 * dropped into `logos/marks/` is used instead where one exists, and the
 * wordmark is the fallback for issuers whose logo is only ever a wordmark.
 */
export function badgeMarkFor(issuer: string): string | null {
  const slug = issuerSlug(issuer)
  return MARK_BY_SLUG[slug] ?? LOGO_BY_SLUG[slug] ?? null
}
