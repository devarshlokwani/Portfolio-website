export interface WallEntry {
  id: string
  name: string
  message: string
  createdAt: number | null
  /** Which account signed it, so the card can show how they signed in. */
  provider: string | null
  /** Set from the console, never by a signer. Floats the entry to the top. */
  pinned: boolean
}
