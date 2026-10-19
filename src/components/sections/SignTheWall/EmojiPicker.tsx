import { useEffect, useRef, useState } from 'react'
import { LuSmile } from 'react-icons/lu'

/**
 * What people actually reach for on a guestbook, rather than every emoji
 * there is.
 *
 * A full picker is a search index, a sprite sheet and a few hundred kilobytes
 * for a 200 character note. These are the ones a short message about somebody
 * else's website is likely to want, grouped roughly by what they are for:
 * approval, warmth, reaction, then the few that stand in for the work itself.
 */
const EMOJI = [
  '👋', '🙌', '👏', '🤝', '💪', '🫡',
  '❤️', '🔥', '✨', '⭐', '💯', '🎉',
  '😄', '😍', '🤩', '😮', '🥹', '😂',
  '👀', '🧠', '💡', '🚀', '⚡', '🎯',
  '💻', '⌨️', '🖱️', '🎨', '📐', '🧩',
  '☕', '🌏', '📌', '✅', '🙏', '🫶',
]

interface EmojiPickerProps {
  /** Called with the chosen emoji, for the field to insert where it likes. */
  onPick: (emoji: string) => void
  disabled?: boolean
}

/**
 * A small emoji palette for the message field.
 *
 * Closes on Escape, on a click outside, and on picking one, because it sits
 * over a form somebody is in the middle of writing and anything that stays
 * open is in their way. Focus returns to the button on Escape so a keyboard
 * user is not dropped back at the top of the page.
 */
export function EmojiPicker({ onPick, disabled = false }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        aria-expanded={open}
        aria-label="Add an emoji"
        title="Add an emoji"
        data-cursor-hover
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-fg-subtle transition-colors hover:border-fg-subtle hover:text-fg disabled:opacity-40"
      >
        <LuSmile className="h-4 w-4" aria-hidden="true" />
      </button>

      {open && (
        // Opens upward: the field sits low in the form, and a panel below it
        // would run off the bottom on a phone.
        <div
          role="group"
          aria-label="Emoji"
          className="absolute bottom-full left-0 z-20 mb-2 w-[17rem] rounded-xl border border-border bg-bg-elevated p-2 shadow-xl"
        >
          <div className="grid grid-cols-6 gap-1">
            {EMOJI.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onPick(emoji)
                  setOpen(false)
                }}
                aria-label={emoji}
                data-cursor-hover
                className="flex h-9 items-center justify-center rounded-lg text-lg transition-colors hover:bg-surface"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
