import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/app/App'
import { env } from '@/shared/config/env'
import '@/styles/global.css'

// Fail fast if public env is misconfigured (no secrets; gateway proxy prefix only).
void env.apiBaseUrl

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
