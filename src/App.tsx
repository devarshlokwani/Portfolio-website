import { AppProviders } from '@/app/providers'
import { CornerMark } from '@/components/ui/CornerMark'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { Nav } from '@/components/ui/Nav'
import { Footer } from '@/components/ui/Footer'
import { IntroLoader } from '@/components/intro/IntroLoader'
import { Hero } from '@/components/sections/Hero/Hero'
import { About } from '@/components/sections/About/About'
import { Experience } from '@/components/sections/Experience/Experience'
import { Skills } from '@/components/sections/Skills/Skills'
import { Projects } from '@/components/sections/Projects/Projects'
import { Contact } from '@/components/sections/Contact/Contact'

function App() {
  return (
    <AppProviders>
      <CustomCursor />
      <IntroLoader />
      <CornerMark />
      <Nav />
      <main>
        <Hero />
        <About />
        <Experience />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </AppProviders>
  )
}

export default App
