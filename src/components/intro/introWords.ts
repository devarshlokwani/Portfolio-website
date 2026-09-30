export const INTRO_WORDS = ['Think', 'Design', 'Build', 'Ship', 'Devarsh Lokwani']

/**
 * Every word in the intro is set in the signature script, the same hand the
 * name itself uses.
 *
 * The action words used to cycle through display/mono/serif-italic variants,
 * which left the closing name as the one script word in the sequence and read
 * as an outlier rather than a finish. Title case rather than caps because a
 * script face set in all-caps stops looking handwritten.
 */
/**
 * What every intro word shares, whatever size it is set at.
 *
 * These live here rather than in the loader's base className because an
 * override replaces the base outright, so each one has to carry the whole
 * treatment itself.
 */
const BASE = 'whitespace-nowrap leading-none text-fg'

const SIGNATURE = `${BASE} font-signature font-normal normal-case tracking-normal`

/** The four action words, none longer than six characters. */
const SIGNATURE_CLASS = `${SIGNATURE} text-[15vw] md:text-[7.5vw]`

/**
 * The closing name, set smaller on narrow screens.
 *
 * Sized against what the scrambler puts on screen, not against the finished
 * word. "Devarsh Lokwani" at 15vw measures 342px on a 390px phone and fits
 * fine, but the characters it cycles through on the way there are wider in
 * this face, and the same fifteen slots filled with them reach 466px. That
 * overflowed, wrapped to a second line for a few frames, and snapped back,
 * which read as the tail of the word being left behind on the right.
 *
 * 12vw keeps the worst of those frames inside a phone's width. Desktop keeps
 * the original size: there is room for it there.
 */
const NAME_CLASS = `${SIGNATURE} text-[12vw] md:text-[7.5vw]`

/** The longest word carries the most scramble characters, so it sets the size. */
const LONG_WORD = 8

/** One class-override per word in INTRO_WORDS. */
export function buildIntroWordClassNames(): (string | undefined)[] {
  return INTRO_WORDS.map((word) => (word.length > LONG_WORD ? NAME_CLASS : SIGNATURE_CLASS))
}
