import { useRef, useState, type FormEvent } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { LuPenLine } from 'react-icons/lu'

import { getClientId, getThrottleRemaining, markSubmitted } from '@/lib/clientId'
import { db, firebaseEnabled } from '@/lib/firebase'
import { containsBlockedWord } from '@/lib/moderation'
import { CtaLaunchButton } from '@/components/ui/CtaLaunchButton'

const NAME_MAX = 40
const MESSAGE_MAX = 200

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function WallEntryForm() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    const trimmedMessage = message.trim()

    if (!trimmedName || !trimmedMessage) {
      setError('Add both a name and a message.')
      return
    }
    if (containsBlockedWord(trimmedName) || containsBlockedWord(trimmedMessage)) {
      setError("Let's keep it clean — try rewording that.")
      return
    }

    const remaining = getThrottleRemaining()
    if (remaining > 0) {
      setError(`You can sign again in ${Math.ceil(remaining / 1000)}s.`)
      return
    }

    if (!firebaseEnabled || !db) {
      setError('The wall is not connected yet — check back soon.')
      return
    }

    setStatus('submitting')
    try {
      await addDoc(collection(db, 'wallEntries'), {
        name: trimmedName.slice(0, NAME_MAX),
        message: trimmedMessage.slice(0, MESSAGE_MAX),
        createdAt: serverTimestamp(),
        clientId: getClientId(),
      })
      markSubmitted()
      setName('')
      setMessage('')
      setStatus('success')
    } catch {
      setStatus('error')
      setError('Something went wrong — try again in a moment.')
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={NAME_MAX}
        placeholder="Your name"
        className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-accent"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={MESSAGE_MAX}
        rows={3}
        placeholder="Leave a message..."
        className="resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-accent"
      />
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-xs text-fg-subtle">
          {error ? (
            <span className="text-accent">{error}</span>
          ) : status === 'success' ? (
            'Thanks for signing the wall!'
          ) : (
            `${message.length}/${MESSAGE_MAX}`
          )}
        </p>
        <CtaLaunchButton
          label={status === 'submitting' ? 'Signing...' : 'Sign the wall'}
          icon={LuPenLine}
          disabled={status === 'submitting'}
          onLaunch={() => formRef.current?.requestSubmit()}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        />
      </div>
    </form>
  )
}
