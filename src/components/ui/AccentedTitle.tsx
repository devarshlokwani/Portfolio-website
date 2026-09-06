import { ACCENT_GRADIENT } from '@/components/ui/gradients'

/**
 * A heading with its last word in the accent gradient, the same treatment
 * the hero's tagline and the sub-footer's headlines wear.
 *
 * Splitting on the final space rather than styling a fixed word keeps it
 * working for any title it is given, from "Claude 101" to "Terms &
 * Conditions", and a single-word title simply comes out fully accented.
 */
export function AccentedTitle({ title }: { title: string }) {
  const cut = title.trimEnd().lastIndexOf(' ')
  if (cut === -1) return <span style={ACCENT_GRADIENT}>{title}</span>

  return (
    <>
      {title.slice(0, cut + 1)}
      <span style={ACCENT_GRADIENT}>{title.slice(cut + 1)}</span>
    </>
  )
}
