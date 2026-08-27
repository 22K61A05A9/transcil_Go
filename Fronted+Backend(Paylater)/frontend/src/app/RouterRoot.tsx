import type { ReactElement } from 'react'
import { Outlet } from 'react-router-dom'

import { UnauthorizedSessionHandler } from '@/app/UnauthorizedSessionHandler'

/** Root layout: session-expiry handler + route outlet. */
export function RouterRoot(): ReactElement {
  return (
    <>
      <UnauthorizedSessionHandler />
      <Outlet />
    </>
  )
}
