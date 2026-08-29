export const INTRO_WORDS = ['THINK', 'DESIGN', 'BUILD', 'SHIP', 'Devarsh Lokwani']

// Variants for the four action words — kept structural/graphic (never
// script) so the mix reads as one deliberately eclectic typeface theme
// rather than "one plain style, plus one random cursive outlier."
const ACTION_WORD_VARIANTS = [
  '', // base: font-display bold uppercase
  'font-mono tracking-normal',
  'font-accent italic font-normal normal-case tracking-normal',
]

const SIGNATURE_CLASS = 'font-signature font-normal normal-case tracking-normal text-[15vw] md:text-[7.5vw]'

/** One class-override choice per word in INTRO_WORDS, randomized for the action words each load; the final (name) word always gets the signature treatment. */
export function buildIntroWordClassNames(): (string | undefined)[] {
  return INTRO_WORDS.map((_, i) =>
    i === INTRO_WORDS.length - 1
      ? SIGNATURE_CLASS
      : ACTION_WORD_VARIANTS[Math.floor(Math.random() * ACTION_WORD_VARIANTS.length)],
  )
}
