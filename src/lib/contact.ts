/**
 * The one address the site points at.
 *
 * Kept here because it appears in six unrelated places: the resume card, the
 * hero's social row, the footer, and both legal pages. Hardcoded in each, a
 * change to it meant finding all six and hoping none were missed, which is
 * exactly the kind of edit where the one that gets missed is the one on the
 * privacy page that a reader is told to write to.
 *
 * Routed through Cloudflare Email Routing to a real inbox. Mail sent here has
 * to actually arrive before this value ships: an address on the domain that
 * bounces is worse than a working address on someone else's.
 */
export const EMAIL = 'hello@devarshlokwani.com'

/** The same address as a link target. */
export const EMAIL_HREF = `mailto:${EMAIL}`
