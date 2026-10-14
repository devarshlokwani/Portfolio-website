/**
 * The one account that moderates the wall.
 *
 * Declared here so the interface and the security rules are reading the same
 * name, but the copy in `firestore.rules` is the one that matters. This
 * constant only decides whether the review controls are drawn; anybody can
 * edit what their browser believes. The rules are what actually stop a
 * signature being approved by the person who wrote it.
 */
export const ADMIN_EMAIL = 'devarshlokwani480@gmail.com'

/** Whether the signed-in account is the moderator. For drawing UI only. */
export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email) && email === ADMIN_EMAIL
}
