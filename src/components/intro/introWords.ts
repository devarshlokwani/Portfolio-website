export const INTRO_WORDS = ['Think', 'Design', 'Build', 'Ship', 'Devarsh Lokwani']

/**
 * Every word in the intro is set in the signature script — the same hand the
 * name itself uses.
 *
 * The action words used to cycle through display/mono/serif-italic variants,
 * which left the closing name as the one script word in the sequence and read
 * as an outlier rather than a finish. Title case rather than caps because a
 * script face set in all-caps stops looking handwritten.
 */
const SIGNATURE_CLASS =
  'font-signature font-normal normal-case tracking-normal text-[15vw] md:text-[7.5vw]'

/** One class-override per word in INTRO_WORDS. */
export function buildIntroWordClassNames(): (string | undefined)[] {
  return INTRO_WORDS.map(() => SIGNATURE_CLASS)
}
