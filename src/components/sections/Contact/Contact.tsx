import { BookingPanel } from '@/components/sections/Contact/BookingPanel'
import { MessageForm } from '@/components/sections/Contact/MessageForm'
import { Section } from '@/components/ui/Section'

export type ContactMode = 'call' | 'message'

interface ContactProps {
  mode: ContactMode
}

/**
 * The contact route's working half: either the booking calendar or the
 * message form, never both.
 *
 * It has no switch of its own. The hero's two CTAs are the only control, so
 * there is exactly one place to choose from rather than a second pair of
 * buttons repeating them a screen further down.
 */
export function Contact({ mode }: ContactProps) {
  return (
    // Tighter than the standard section rhythm. The hero's buttons are this
    // section's switch, so the panel they control has to stay near them: a
    // full section's padding put half a screen between the control and the
    // thing it changes.
    <Section id="contact" className="!py-10 md:!py-14">
      {mode === 'call' ? <BookingPanel /> : <MessageForm />}
    </Section>
  )
}
