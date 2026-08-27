/**
 * Bridge between the HTTP client and React auth/navigation.
 * Registered once inside the router tree (see UnauthorizedSessionHandler).
 */

type UnauthorizedSessionHandler = () => void

let handler: UnauthorizedSessionHandler | null = null

export function setUnauthorizedSessionHandler(
  next: UnauthorizedSessionHandler | null,
): void {
  handler = next
}

/** Clears the session and redirects to login when an authenticated request returns 401. */
export function notifyUnauthorizedSession(): void {
  handler?.()
}
