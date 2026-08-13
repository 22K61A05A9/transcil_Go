import type { ReactElement } from 'react'
import { RouterProvider } from 'react-router-dom'

import { AppProviders } from '@/app/providers'
import { router } from '@/app/router'
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary'
import { ToastContainer } from '@/shared/ui/ToastContainer'

export function App(): ReactElement {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
        <ToastContainer />
      </AppProviders>
    </ErrorBoundary>
  )
}


