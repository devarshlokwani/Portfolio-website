import { CertificateList } from '@/components/sections/Certificates/CertificateList'
import { CertificateWall } from '@/components/sections/Certificates/CertificateWall'
import { CERTIFICATES } from '@/components/sections/Certificates/certificateData'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'

export type CertificateView = 'quick' | 'wall'

const COPY: Record<CertificateView, { title: string; intro: string }> = {
  quick: {
    title: 'Quick view',
    intro: 'Every certificate on one line. Open a row for the detail and the certificate itself.',
  },
  wall: {
    title: 'The wall',
    intro: 'Courses finished and credentials earned, most recent first, hung side by side.',
  },
}

/**
 * The certificates route's working half, in whichever of the two views the
 * hero's buttons selected.
 *
 * It has no switch of its own. The hero's pair is the only control, so there
 * is one place to choose from rather than a second set of buttons repeating
 * them a screen further down.
 */
export function Certificates({ view }: { view: CertificateView }) {
  const copy = COPY[view]

  return (
    <Section id="certificates">
      <SectionHeading
        title={copy.title}
        intro={copy.intro}
        action={
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
            {CERTIFICATES.length} total
          </p>
        }
      />

      {view === 'wall' ? <CertificateWall /> : <CertificateList />}
    </Section>
  )
}
