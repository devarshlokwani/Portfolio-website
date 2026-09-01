import { useRef, useState, type FormEvent } from 'react'
import { LuMail } from 'react-icons/lu'

import { CtaLaunchButton } from '@/components/ui/CtaLaunchButton'
import { Section } from '@/components/ui/Section'

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID
const EMAIL = 'devarshlokwani480@gmail.com'

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/' },
  { label: 'LinkedIn', href: 'https://linkedin.com/' },
  { label: 'Email', href: `mailto:${EMAIL}` },
]

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function Contact() {
  const [status, setStatus] = useState<Status>('idle')
  const formRef = useRef<HTMLFormElement>(null)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!FORMSPREE_ID) {
      setStatus('error')
      return
    }

    const form = e.currentTarget
    setStatus('submitting')

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      })
      if (res.ok) {
        setStatus('success')
        form.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <Section id="contact" label="05 — Contact">
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <h2 className="font-display text-3xl font-semibold text-fg md:text-5xl">
            Let's build something
          </h2>
          <p className="mt-6 max-w-sm text-fg-muted">
            Looking for a graduate software engineer, or just want to talk shop? My inbox is
            open.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  data-cursor-hover
                  className="link-underline font-mono text-sm text-fg-muted transition-colors hover:text-accent"
                >
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>

        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            name="name"
            required
            placeholder="Your name"
            className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-accent"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="Your email"
            className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-accent"
          />
          <textarea
            name="message"
            required
            rows={4}
            placeholder="What's on your mind?"
            className="resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-accent"
          />
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-xs text-fg-subtle">
              {status === 'success' && 'Message sent — thank you!'}
              {status === 'error' && "Couldn't send — try emailing directly instead."}
            </p>
            <CtaLaunchButton
              label={status === 'submitting' ? 'Sending...' : 'Send message'}
              icon={LuMail}
              disabled={status === 'submitting'}
              onLaunch={() => formRef.current?.requestSubmit()}
              className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            />
          </div>
        </form>
      </div>
    </Section>
  )
}
