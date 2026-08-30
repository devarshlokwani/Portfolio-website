import { About } from '@/components/sections/About/About'
import { Contact } from '@/components/sections/Contact/Contact'
import { Hero } from '@/components/sections/Hero/Hero'
import { Projects } from '@/components/sections/Projects/Projects'
import { Skills } from '@/components/sections/Skills/Skills'

export function HomePage() {
  return (
    <main>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Contact />
    </main>
  )
}
