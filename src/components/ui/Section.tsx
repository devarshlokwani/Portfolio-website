import type { ReactNode } from 'react'

import { useScrollReveal } from '@/hooks/useScrollReveal'

interface SectionProps {
  id: string
  children: ReactNode
  className?: string
  /** eyebrow label shown above the section, e.g. "02: Skills" */
  label?: string
}

export function Section({ id, children, className = '', label }: SectionProps) {
  const ref = useScrollReveal<HTMLElement>({ y: 32 })

  return (
    <section
      id={id}
      ref={ref}
      className={`relative mx-auto w-full max-w-6xl px-6 py-24 md:px-10 md:py-32 ${className}`}
    >
      {label && (
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">{label}</p>
      )}
      {children}
    </section>
  )
}
