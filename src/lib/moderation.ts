// Casual-abuse filter only — not a substitute for the Firestore rules' length caps and
// App Check's bot filtering, which are what actually secure this endpoint.
const BLOCKLIST = ['fuck', 'shit', 'bitch', 'asshole', 'cunt', 'nigger', 'faggot']

export function containsBlockedWord(text: string): boolean {
  const lower = text.toLowerCase()
  return BLOCKLIST.some((word) => lower.includes(word))
}
