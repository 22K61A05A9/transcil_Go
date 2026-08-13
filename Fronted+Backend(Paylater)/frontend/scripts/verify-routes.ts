/**
 * Route-guard verification (no backend required).
 * Mirrors production route protection without importing Login CSS into Node.
 * Run: npm run verify:routes
 */
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createMemoryRouter,
  Navigate,
  RouterProvider,
  type RouteObject,
} from 'react-router-dom'
import { Window } from 'happy-dom'

import { ProtectedRoute } from '../src/app/routing/ProtectedRoute'
import { PublicOnlyRoute } from '../src/app/routing/PublicOnlyRoute'
import { AuthProvider } from '../src/shared/auth/AuthProvider'
import { clearSession, setToken } from '../src/shared/auth/tokenStorage'

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

function page(text: string) {
  return createElement('main', null, text)
}

/** Same guard structure as src/app/router.tsx */
const testRoutes: RouteObject[] = [
  {
    path: '/',
    element: createElement(Navigate, { to: '/login', replace: true }),
  },
  {
    path: '/login',
    element: createElement(PublicOnlyRoute),
    children: [{ index: true, element: page('Sign in') }],
  },
  {
    path: '/user',
    element: createElement(ProtectedRoute, { allowedRoles: ['user'] }),
    children: [
      { index: true, element: page('User area') },
      { path: '*', element: page('User area') },
    ],
  },
  {
    path: '/merchant',
    element: createElement(ProtectedRoute, { allowedRoles: ['merchant'] }),
    children: [
      { index: true, element: page('Merchant area') },
      { path: '*', element: page('Merchant area') },
    ],
  },
  {
    path: '/admin',
    element: createElement(ProtectedRoute, {
      allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    }),
    children: [
      { index: true, element: page('Admin area') },
      { path: '*', element: page('Admin area') },
    ],
  },
  {
    path: '*',
    element: createElement(Navigate, { to: '/login', replace: true }),
  },
]

async function renderAt(
  initialPath: string,
): Promise<{ path: string; text: string }> {
  const host = document.createElement('div')
  document.body.appendChild(host)

  const memoryRouter = createMemoryRouter(testRoutes, {
    initialEntries: [initialPath],
  })

  createRoot(host).render(
    createElement(
      AuthProvider,
      null,
      createElement(RouterProvider, { router: memoryRouter }),
    ),
  )

  await delay(80)

  return {
    path: memoryRouter.state.location.pathname,
    text: host.textContent ?? '',
  }
}

async function main(): Promise<void> {
  installDom()
  const validExp = Math.floor(Date.now() / 1000) + 3600

  {
    clearSession()
    const result = await renderAt('/login')
    assert(result.path === '/login', `case1 path=${result.path}`)
    assert(result.text.includes('Sign in'), 'case1 login UI')
    console.log('OK case1 no token /login')
  }

  for (const area of ['/user', '/merchant', '/admin'] as const) {
    clearSession()
    const result = await renderAt(area)
    assert(result.path === '/login', `unauth ${area} → ${result.path}`)
    console.log(`OK no token ${area} → /login`)
  }

  {
    clearSession()
    setToken(makeUnsignedJwt({ id: 1, role: 'user', exp: validExp }))
    const result = await renderAt('/user')
    assert(result.path === '/user', `case5 path=${result.path}`)
    assert(result.text.includes('User area'), 'case5 content')
    console.log('OK case5 user /user')
  }

  {
    clearSession()
    setToken(makeUnsignedJwt({ id: 1, role: 'user', exp: validExp }))
    const result = await renderAt('/merchant')
    assert(result.text.includes('Access denied'), 'case6 unauthorized')
    console.log('OK case6 user /merchant denied')
  }

  {
    clearSession()
    setToken(makeUnsignedJwt({ id: 1, role: 'user', exp: validExp }))
    const result = await renderAt('/admin')
    assert(result.text.includes('Access denied'), 'case7 unauthorized')
    console.log('OK case7 user /admin denied')
  }

  {
    clearSession()
    setToken(makeUnsignedJwt({ id: 2, role: 'merchant', exp: validExp }))
    const result = await renderAt('/merchant')
    assert(result.path === '/merchant', `case8 path=${result.path}`)
    assert(result.text.includes('Merchant area'), 'case8 content')
    console.log('OK case8 merchant /merchant')
  }

  {
    clearSession()
    setToken(makeUnsignedJwt({ id: 2, role: 'merchant', exp: validExp }))
    const result = await renderAt('/admin')
    assert(result.text.includes('Access denied'), 'case9 unauthorized')
    console.log('OK case9 merchant /admin denied')
  }

  {
    clearSession()
    setToken(makeUnsignedJwt({ id: 3, role: 'ADMIN', exp: validExp }))
    const result = await renderAt('/admin')
    assert(result.path === '/admin', `case10 path=${result.path}`)
    assert(result.text.includes('Admin area'), 'case10 content')
    console.log('OK case10 ADMIN /admin')
  }

  {
    clearSession()
    setToken(makeUnsignedJwt({ id: 4, role: 'SUPER_ADMIN', exp: validExp }))
    const result = await renderAt('/admin')
    assert(result.path === '/admin', `case11 path=${result.path}`)
    assert(result.text.includes('Admin area'), 'case11 content')
    console.log('OK case11 SUPER_ADMIN /admin')
  }

  {
    clearSession()
    setToken(makeUnsignedJwt({ id: 1, role: 'user', exp: validExp }))
    const result = await renderAt('/login')
    assert(result.path === '/user', `case12 path=${result.path}`)
    console.log('OK case12 authenticated /login → /user')
  }

  {
    clearSession()
    setToken(makeUnsignedJwt({ id: 3, role: 'ADMIN', exp: validExp }))
    const result = await renderAt('/login')
    assert(result.path === '/admin', `admin login redirect=${result.path}`)
    console.log('OK authenticated ADMIN /login → /admin')
  }

  {
    clearSession()
    setToken(makeUnsignedJwt({ id: 5, role: 'merchant', exp: validExp }))
    const result = await renderAt('/login')
    assert(result.path === '/merchant', `merchant login redirect=${result.path}`)
    console.log('OK authenticated merchant /login → /merchant')
  }

  console.log('\nAll route-guard checks passed.')
}

void main()
