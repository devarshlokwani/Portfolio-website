export interface WallEntry {
  id: string
  name: string
  message: string
  createdAt: number | null
  /** Which account signed it, so the card can show how they signed in. */
  provider: string | null
  /** The avatar the provider handed back, or null if it had none. */
  photoURL: string | null
  /** Set by the admin, never by a signer. Floats the entry to the top. */
  pinned: boolean
  /**
   * Whether the admin has cleared it for the public wall.
   *
   * A signature starts false and stays off the wall until reviewed. Editing
   * one sends it back to false, because the words that were approved are no
   * longer the words that would be shown.
   */
  approved: boolean
}
