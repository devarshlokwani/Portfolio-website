import type { ReactNode } from 'react'

interface LegalLayoutProps {
  title: string
  lastUpdated: string
  children: ReactNode
}

/**
 * Shared prose shell for the standalone legal pages (Privacy Policy, Terms
 * & Conditions) — plain readable text rather than portfolio-style sections,
 * but still themed/spaced consistently with the rest of the site.
 */
export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-24 pt-32 md:px-10 md:pt-36">
      <h1 className="font-display text-4xl font-semibold text-fg md:text-5xl">{title}</h1>
      <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
        Last updated {lastUpdated}
      </p>
      <div className="prose-legal mt-12 flex flex-col gap-8 text-fg-muted [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-fg [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-4 [&_p]:leading-relaxed [&_ul+p]:mt-4 [&_ul]:mt-3 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
        {children}
      </div>
    </main>
  )
}
