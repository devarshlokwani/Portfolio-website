import { LuArrowUpRight, LuBadgeCheck } from 'react-icons/lu'

import badgeArt from '@/assets/aws-ai-practitioner-badge.webp'

const BADGE = {
  title: 'AWS Certified AI Practitioner',
  issuer: 'Amazon Web Services Training and Certification',
  level: 'Foundational',
  issued: 'September 2026',
  expires: 'September 2029',
  url: 'https://www.credly.com/badges/9f23c439-4050-469e-8be9-aa38d5292e7d',
}

/**
 * The AWS badge, at the foot of the certificates route.
 *
 * Kept apart from the wall above it because it is a different kind of thing.
 * Those are courses finished, this is an exam sat and a credential that
 * expires, and lining it up beside them as one more tile would flatten that
 * distinction.
 *
 * Credly hands out an embed for this: a script from their CDN that injects
 * an iframe. It is not used, for the same reason the DMCA badge in the
 * footer is served from this domain rather than theirs. That script would
 * put a third-party request on this page for every visitor and hand Credly
 * each of their IP addresses before the page had finished loading, which
 * would make the privacy policy's claim about third-party requests untrue.
 * What it actually does is show an image and link to the verification page,
 * so that is what is done here directly. The artwork is Credly's, served
 * from this domain, and the link still goes to them for verification, which
 * is the part that has to be theirs to be worth anything.
 */
export function CredlyBadge() {
  return (
    <div className="mt-16 border-t border-border pt-12 md:mt-20 md:pt-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
        Verified credential
      </p>

      <div className="mt-6 flex flex-col items-center gap-6 rounded-2xl border border-border bg-surface p-6 text-center sm:flex-row sm:items-center sm:gap-8 sm:p-8 sm:text-left">
        <img
          src={badgeArt}
          alt={`${BADGE.title} badge, issued by ${BADGE.issuer}`}
          loading="lazy"
          width={320}
          height={320}
          className="h-28 w-28 shrink-0 md:h-32 md:w-32"
        />

        <div className="min-w-0">
          <h3 className="font-display text-xl font-semibold text-fg md:text-2xl">{BADGE.title}</h3>
          <p className="mt-1 text-sm text-fg-muted">{BADGE.issuer}</p>

          <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-fg-subtle sm:justify-start">
            <span>{BADGE.level}</span>
            <span>Issued {BADGE.issued}</span>
            <span>Expires {BADGE.expires}</span>
          </div>

          <a
            href={BADGE.url}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-hover
            className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.15em] text-fg transition-colors hover:text-accent"
          >
            <LuBadgeCheck className="h-4 w-4" aria-hidden="true" />
            Verify on Credly
            <LuArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  )
}
