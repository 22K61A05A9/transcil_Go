/**
 * Guest (unauthenticated) access contract for PayLater.
 *
 * "Guest only" routes are wrapped by `PublicOnlyRoute`: signed-in users are
 * redirected to their role home. Protected areas require a valid JWT.
 *
 * Public API endpoints are called with `token: null` in the shared HTTP client
 * so no Authorization header is sent. There is no guest role, guest token, or
 * special request header — the backend treats missing JWT as unauthenticated.
 */

/** Frontend routes reachable without a session (PublicOnlyRoute). */
export const GUEST_ROUTE_PATHS = {
  login: '/login',
  register: '/register',
  merchantRegister: '/merchant/register',
} as const

export type GuestRoutePath =
  (typeof GUEST_ROUTE_PATHS)[keyof typeof GUEST_ROUTE_PATHS]

const GUEST_ROUTE_PATH_LIST: readonly GuestRoutePath[] = [
  GUEST_ROUTE_PATHS.login,
  GUEST_ROUTE_PATHS.register,
  GUEST_ROUTE_PATHS.merchantRegister,
]

/** True when `pathname` is a guest-only route (exact or nested under it). */
export function isGuestRoute(pathname: string): boolean {
  return GUEST_ROUTE_PATH_LIST.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

/**
 * Gateway endpoints that do not require a JWT.
 * Must stay aligned with gateway route registration and feature API modules.
 */
export const GUEST_API_ENDPOINTS = {
  userLogin: '/user/login',
  merchantLogin: '/merchant/login',
  adminLogin: '/admin/login',
  userRegister: '/users',
  merchantRegister: '/merchants/register',
  merchantCatalog: '/merchants/available',
} as const
