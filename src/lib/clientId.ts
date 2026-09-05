const CLIENT_ID_KEY = 'wall-client-id'
const LAST_SUBMIT_KEY = 'wall-last-submit'
const THROTTLE_MS = 60_000

export function getClientId(): string {
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(CLIENT_ID_KEY, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

/** Returns ms remaining before another submission is allowed, or 0 if allowed now. */
export function getThrottleRemaining(): number {
  try {
    const last = Number(localStorage.getItem(LAST_SUBMIT_KEY) ?? 0)
    const remaining = THROTTLE_MS - (Date.now() - last)
    return remaining > 0 ? remaining : 0
  } catch {
    return 0
  }
}

export function markSubmitted(): void {
  try {
    localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()))
  } catch {
    // localStorage unavailable: throttle simply won't persist across reloads for this visitor.
  }
}
