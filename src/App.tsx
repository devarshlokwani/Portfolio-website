import { lazy, Suspense } from 'react'

import { AppProviders } from '@/app/providers'
import { CornerMark } from '@/components/ui/CornerMark'
import { Nav } from '@/components/ui/Nav'
import { Footer } from '@/components/ui/Footer'
import { IntroLoader } from '@/components/intro/IntroLoader'
import { Hero } from '@/components/sections/Hero/Hero'
import { About } from '@/components/sections/About/About'
import { Experience } from '@/components/sections/Experience/Experience'
import { Skills } from '@/components/sections/Skills/Skills'
import { Projects } from '@/components/sections/Projects/Projects'
import { Contact } from '@/components/sections/Contact/Contact'

// Code-split: this is the only part of the site that pulls in the Firebase
// SDK, so visitors who never scroll this far never pay for it.
const SignTheWall = lazy(() =>
  import('@/components/sections/SignTheWall/SignTheWall').then((m) => ({
    default: m.SignTheWall,
  })),
)

function App() {
  return (
    <AppProviders>
      <IntroLoader />
      <CornerMark />
      <Nav />
      <main>
        <Hero />
        <About />
        <Experience />
        <Skills />
        <Projects />
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <SignTheWall />
        </Suspense>
        <Contact />
      </main>
      <Footer />
    </AppProviders>
  )
}

export default App
