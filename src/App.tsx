import { Navigate, Route, Routes } from 'react-router-dom'

import { AppProviders } from '@/app/providers'
import { HeroTransitionProvider } from '@/app/HeroTransitionProvider'
import { RouteTransitionProvider } from '@/app/RouteTransitionProvider'
import { CornerMark } from '@/components/ui/CornerMark'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { Nav } from '@/components/ui/Nav'
import { Footer } from '@/components/ui/Footer'
import { IntroLoader } from '@/components/intro/IntroLoader'
import { HomePage } from '@/pages/HomePage'
import { ExperiencePage } from '@/pages/ExperiencePage'
import { PrivacyPolicy } from '@/pages/PrivacyPolicy'
import { TermsAndConditions } from '@/pages/TermsAndConditions'

function App() {
  return (
    <AppProviders>
      <HeroTransitionProvider>
        <RouteTransitionProvider>
          <CustomCursor />
          <IntroLoader />
          <CornerMark />
          <Nav />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            {/* any unknown path (typos, old bookmarks, etc.) lands on Home instead of rendering blank */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </RouteTransitionProvider>
      </HeroTransitionProvider>
    </AppProviders>
  )
}

export default App
