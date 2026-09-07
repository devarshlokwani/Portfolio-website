import { useRef, useState, type FormEvent } from 'react'
import { LuMail } from 'react-icons/lu'

import { CtaLaunchButton } from '@/components/ui/CtaLaunchButton'

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID
const MAX_MESSAGE = 1000

type Status = 'idle' | 'submitting' | 'success' | 'error'

/**
 * Focus lifts the field itself, by brightening its border and raising it off
 * the page onto the surface colour, instead of ringing it in accent. The
 * accent treatment drew two orange lines around a focused input, its own
 * border plus the global focus ring, and an orange outline on a text field
 * reads as a validation error besides.
 *
 * The ring is overridden rather than removed globally, and only here: it is
 * declared unlayered in index.css, which outranks a Tailwind utility no
 * matter the specificity, so this needs the important flag to land.
 */
const FIELD =
  'w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-fg transition-colors placeholder:text-fg-subtle hover:border-fg-subtle focus:border-fg focus:bg-surface focus-visible:!outline-none'

function Label({ htmlFor, children, hint }: { htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-fg">
      {children}
      {hint && <span className="ml-1.5 font-normal text-fg-subtle">{hint}</span>}
    </label>
  )
}

export function MessageForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [count, setCount] = useState(0)
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
        setCount(0)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <h3 className="font-display text-3xl font-semibold text-fg md:text-4xl">
          Send me a message
        </h3>
        <p className="mt-3 text-fg-muted">
          Have a question or want to work together? Drop me a message.
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="mt-10 rounded-2xl border border-border bg-surface p-7 md:p-8"
      >
        {/* Labels rather than placeholder-only fields: a placeholder vanishes
            the moment someone starts typing, which leaves a half-filled form
            with no way to tell what each box was for. */}
        <Label htmlFor="name" hint="(optional)">
          Name
        </Label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          className={FIELD}
        />

        <div className="mt-5">
          <Label htmlFor="email">
            Email <span className="text-accent">*</span>
          </Label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="your@email.com"
            className={FIELD}
          />
        </div>

        <div className="mt-5">
          <div className="flex items-end justify-between">
            <Label htmlFor="message">
              Message <span className="text-accent">*</span>
            </Label>
            <span className="mb-2 font-mono text-xs text-fg-subtle">
              {count}/{MAX_MESSAGE}
            </span>
          </div>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            maxLength={MAX_MESSAGE}
            onChange={(e) => setCount(e.target.value.length)}
            placeholder="What would you like to discuss?"
            className={`${FIELD} resize-none`}
          />
        </div>

        {/* Said at the point of collection rather than only in the policy: the
            person deciding whether to send this is standing here, not on the
            privacy page. */}
        <p className="mt-5 text-xs leading-relaxed text-fg-muted">
          Your message is delivered through Formspree and goes straight to my inbox. It is used
          only to reply to you, never added to a mailing list or shared.{' '}
          <a href="/privacy" className="underline underline-offset-4 hover:text-fg">
            Privacy policy
          </a>
          .
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p role="status" className="font-mono text-xs text-fg-subtle">
            {status === 'success' && 'Message sent. Thank you!'}
            {status === 'error' && "Couldn't send. Try emailing directly instead."}
          </p>
          <CtaLaunchButton
            label={status === 'submitting' ? 'Sending...' : 'Send message'}
            icon={LuMail}
            disabled={status === 'submitting'}
            onLaunch={() => formRef.current?.requestSubmit()}
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition-[transform,translate,rotate,scale] hover:-translate-y-0.5 disabled:opacity-50"
          />
        </div>
      </form>
    </div>
  )
}
