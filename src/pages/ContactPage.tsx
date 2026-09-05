import { useState } from 'react'

import { Contact, type ContactMode } from '@/components/sections/Contact/Contact'
import { ContactHero } from '@/pages/ContactHero'

/**
 * Hero, then whichever panel the hero's CTAs selected. The sub-footer and
 * footer are global, mounted once in App after the routes.
 */
export function ContactPage() {
  const [mode, setMode] = useState<ContactMode>('call')

  return (
    <main>
      <ContactHero onSelect={setMode} />
      <Contact mode={mode} />
    </main>
  )
}
