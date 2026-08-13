/**
 * AuthProvider / useAuth foundation checks.
 * Run: npm run verify:auth-provider
 */
import {
  Component,
  createElement,
  useEffect,
  type ErrorInfo,
  type ReactElement,
  type ReactNode,
} from 'react'
import { createRoot } from 'react-dom/client'
import { Window } from 'happy-dom'

import { AuthProvider } from '../src/shared/auth/AuthProvider'
import { useAuth } from '../src/shared/auth/useAuth'
import { clearSession, getToken, setToken } from '../src/shared/auth/tokenStorage'

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message)
  }
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function makeUnsignedJwt(payload: Record<string, unknown>): string {
  const header = encodeBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const body = encodeBase64Url(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

function installDom(): void {
  const window = new Window({ url: 'http://localhost:5173/' })

  Object.defineProperty(globalThis, 'window', {
    value: window,
    configurable: true,
  })
  Object.defineProperty(globalThis, 'document', {
    value: window.document,
    configurable: true,
  })
  Object.defineProperty(globalThis, 'localStorage', {
    value: window.localStorage,
    configurable: true,
  })
  Object.defineProperty(globalThis, 'navigator', {
    value: window.navigator,
    configurable: true,
  })
  Object.defineProperty(globalThis, 'MutationObserver', {
    value: window.MutationObserver,
    configurable: true,
  })
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function waitFor(
  predicate: () => boolean,
  timeoutMs = 500,
  intervalMs = 25,
): Promise<void> {
  const start = Date.now()
  while (!predicate()) {
    if (Date.now() - start >= timeoutMs) {
      throw new Error('waitFor timed out')
    }
    await delay(intervalMs)
  }
}

function mount(node: ReactElement): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  createRoot(host).render(node)
}

type AuthApi = ReturnType<typeof useAuth>

function AuthProbe(props: { onChange: (auth: AuthApi) => void }): null {
  const auth = useAuth()
  useEffect(() => {
    props.onChange(auth)
  }, [auth, props])
  return null
}

class ErrorBoundary extends Component<
  {
    children: ReactNode
    onError: (error: Error) => void
  },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }

  override componentDidCatch(error: Error, _info: ErrorInfo): void {
    this.props.onError(error)
  }

  override render(): ReactNode {
    if (this.state.failed) {
      return null
    }
    return this.props.children
  }
}

function OutsideHook(): null {
  useAuth()
  return null
}

async function main(): Promise<void> {
  installDom()

  // --- no stored token ---
  clearSession()
  {
    let latest: AuthApi | null = null
    mount(
      createElement(
        AuthProvider,
        null,
        createElement(AuthProbe, {
          onChange: (auth) => {
            latest = auth
          },
        }),
      ),
    )
    await waitFor(() => latest !== null)
    assert(latest.isAuthenticated === false, 'unauthenticated without token')
    assert(latest.session === null, 'null session without token')
    assert(latest.userId === null && latest.role === null, 'null id/role')
    console.log('OK init with no token')
  }

  // --- startup with valid stored token ---
  {
    clearSession()
    const token = makeUnsignedJwt({
      id: 42,
      role: 'user',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
    setToken(token)

    let latest: AuthApi | null = null
    mount(
      createElement(
        AuthProvider,
        null,
        createElement(AuthProbe, {
          onChange: (auth) => {
            latest = auth
          },
        }),
      ),
    )
    await waitFor(() => latest !== null)
    assert(latest.isAuthenticated === true, 'authenticated from storage')
    assert(latest.userId === 42, 'userId from JWT')
    assert(latest.role === 'user', 'role from JWT')
    assert(latest.session?.token === token, 'session token')
    console.log('OK init with valid stored token')
  }

  // --- login(token) updates state + storage ---
  {
    clearSession()
    const token = makeUnsignedJwt({
      id: 9,
      role: 'merchant',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })

    let latest: AuthApi | null = null
    let didLogin = false

    function LoginFlow(): null {
      const auth = useAuth()
      useEffect(() => {
        latest = auth
        if (!didLogin) {
          didLogin = true
          auth.login(token)
        }
      }, [auth])
      return null
    }

    mount(createElement(AuthProvider, null, createElement(LoginFlow)))
    await waitFor(() => latest !== null && latest.isAuthenticated === true)
    assert(latest.isAuthenticated === true, 'login authenticated')
    assert(latest.userId === 9 && latest.role === 'merchant', 'login claims')
    assert(getToken() === token, 'token persisted')
    console.log('OK login(token)')
  }

  // --- logout ---
  {
    clearSession()
    const token = makeUnsignedJwt({
      id: 3,
      role: 'ADMIN',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
    setToken(token)

    let latest: AuthApi | null = null
    let didLogout = false

    function LogoutFlow(): null {
      const auth = useAuth()
      useEffect(() => {
        latest = auth
        if (auth.isAuthenticated && !didLogout) {
          didLogout = true
          auth.logout()
        }
      }, [auth])
      return null
    }

    mount(createElement(AuthProvider, null, createElement(LogoutFlow)))
    await waitFor(() => latest !== null && latest.isAuthenticated === false)
    assert(latest.isAuthenticated === false, 'logout cleared auth')
    assert(latest.session === null, 'logout cleared session')
    assert(getToken() === null, 'logout cleared storage')
    console.log('OK logout()')
  }

  // --- expired token on startup ---
  {
    clearSession()
    setToken(
      makeUnsignedJwt({
        id: 1,
        role: 'SUPER_ADMIN',
        exp: Math.floor(Date.now() / 1000) - 30,
      }),
    )

    let latest: AuthApi | null = null
    mount(
      createElement(
        AuthProvider,
        null,
        createElement(AuthProbe, {
          onChange: (auth) => {
            latest = auth
          },
        }),
      ),
    )
    await waitFor(() => latest !== null)
    assert(latest.isAuthenticated === false, 'expired → unauthenticated')
    assert(getToken() === null, 'expired token removed from storage')
    console.log('OK expired token cleared on startup')
  }

  // --- useAuth outside provider ---
  {
    let captured: Error | null = null
    const prevConsoleError = console.error
    console.error = () => {}

    mount(
      createElement(
        ErrorBoundary,
        {
          onError: (error) => {
            captured = error
          },
          children: createElement(OutsideHook),
        },
        createElement(OutsideHook),
      ),
    )
    await waitFor(() => captured !== null)
    console.error = prevConsoleError

    assert(captured !== null, 'expected error from useAuth outside provider')
    assert(
      captured.message.includes('useAuth must be used within an AuthProvider'),
      `unexpected message: ${captured.message}`,
    )
    console.log('OK useAuth outside provider throws clear error')
  }

  console.log('\nAll AuthProvider checks passed.')
}

void main()
