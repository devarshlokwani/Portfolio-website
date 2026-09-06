import { useState } from 'react'

import { Certificates, type CertificateView } from '@/components/sections/Certificates/Certificates'
import { CertificatesHero } from '@/pages/CertificatesHero'

/**
 * Its own route rather than a section on Home. A wall only reads as a wall
 * at some size, and dropping one into the home page's run of sections would
 * either shrink it to a strip or stall the scroll partway through the story
 * the rest of that page is telling.
 *
 * The wall is the default: it is what the route is for, and the quick view
 * is the way out of it once there are more certificates than fit on screen.
 */
export function CertificatesPage() {
  const [view, setView] = useState<CertificateView>('wall')

  return (
    <main>
      <CertificatesHero onSelect={setView} />
      <Certificates view={view} />
    </main>
  )
}
