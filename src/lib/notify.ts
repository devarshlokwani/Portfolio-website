/**
 * The one email this site ever sends a visitor: your signature is up.
 *
 * Firebase is on the free plan, which has no Cloud Functions, so there is no
 * server of ours to send from. EmailJS is the shape that fits: a hosted
 * template, triggered from the browser with a publishable key that is locked
 * to this domain in their dashboard. Called over their REST endpoint rather
 * than through their SDK, because the whole of it is one POST and a
 * dependency for that is a dependency to keep updated forever.
 *
 * Only the admin's browser ever calls this, on approving a signature. It is
 * not a mailing list and there is nothing to unsubscribe from: one message,
 * once, for the thing the person actually did.
 */

const ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send'

const env = (value: string | undefined) => value?.trim() || undefined

const serviceId = env(import.meta.env.VITE_EMAILJS_SERVICE_ID)
const templateId = env(import.meta.env.VITE_EMAILJS_TEMPLATE_ID)
const publicKey = env(import.meta.env.VITE_EMAILJS_PUBLIC_KEY)

/**
 * Whether the three settings are present.
 *
 * Absent, approving still works and simply sends nothing, which is the right
 * failure: moderation is the feature, the email is the courtesy on top of it.
 */
export const notifyEnabled = Boolean(serviceId && templateId && publicKey)

export interface ApprovalNotice {
  email: string
  name: string
}

/**
 * Sends the approval note. Resolves to whether it went.
 *
 * Deliberately returns a boolean rather than throwing: the caller is a click
 * that has already approved the signature, and a failed email is not a
 * reason to tell the admin the approval failed. What it is a reason for is
 * not recording the notification, so the next approval tries again.
 */
export async function sendApprovalNotice({ email, name }: ApprovalNotice): Promise<boolean> {
  if (!notifyEnabled) return false

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          // These names are what the EmailJS template refers to. Changing one
          // here without changing it there sends a message with a hole in it,
          // so they are kept dull and obvious. `to_email` is the one that has
          // to match the template's To field or nothing is delivered at all.
          to_email: email,
          to_name: name,
          site_url: window.location.origin,
          wall_url: `${window.location.origin}/wall#signatures`,
        },
      }),
    })

    if (!response.ok) {
      console.error('[wall] approval email refused:', response.status, await response.text())
      return false
    }
    return true
  } catch (e) {
    console.error('[wall] approval email failed:', e)
    return false
  }
}
