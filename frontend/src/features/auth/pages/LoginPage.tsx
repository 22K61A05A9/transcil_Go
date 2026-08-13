import { useCallback, useRef, useState, type ReactElement } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { LoginForm } from '@/features/auth/components/LoginForm'
import { LoginHeader } from '@/features/auth/components/LoginHeader'
import { RegisterTypeDialog } from '@/features/auth/components/RegisterTypeDialog'
import { loginByActor } from '@/features/auth/lib/loginByActor'
import { getLoginErrorMessage } from '@/features/auth/lib/loginErrors'
import { getPostLoginPath } from '@/features/auth/lib/postLoginPath'
import type {
  AuthLoginActor,
  LoginNavigationState,
} from '@/features/auth/types'
import { useAuth } from '@/shared/auth/useAuth'
import '@/features/auth/styles/login.css'

function readLoginNavigationState(
  state: unknown,
): LoginNavigationState | undefined {
  if (typeof state !== 'object' || state === null) {
    return undefined
  }
  return state as LoginNavigationState
}

function initialRoleFromState(
  state: LoginNavigationState | undefined,
): AuthLoginActor {
  if (state?.registeredActor === 'merchant') {
    return 'merchant'
  }
  return 'user'
}

function successMessageFromState(
  state: LoginNavigationState | undefined,
): string | null {
  if (state?.registrationSuccess !== true) {
    return null
  }
  if (state.registeredActor === 'merchant') {
    return 'Merchant account created successfully. Sign in with your merchant credentials.'
  }
  return 'Your account has been created. Please sign in to continue.'
}

export function LoginPage(): ReactElement {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const registerTriggerRef = useRef<HTMLButtonElement>(null)

  const navigationState = readLoginNavigationState(location.state)

  const [role, setRole] = useState<AuthLoginActor>(() =>
    initialRoleFromState(navigationState),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)

  const successMessage = successMessageFromState(navigationState)

  const closeRegisterDialog = useCallback((): void => {
    setIsRegisterDialogOpen(false)
    window.requestAnimationFrame(() => {
      registerTriggerRef.current?.focus()
    })
  }, [])

  async function handleSubmit(email: string, password: string): Promise<void> {
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const response = await loginByActor(role, { email, password })
      login(response.token)
      void navigate(getPostLoginPath(role), { replace: true })
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-page__shell">
        <LoginHeader />
        <section className="login-page__card" aria-label="Sign in">
          <LoginForm
            role={role}
            initialEmail={navigationState?.registeredEmail ?? ''}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            successMessage={successMessage}
            registerTriggerRef={registerTriggerRef}
            onRoleChange={(nextRole) => {
              setRole(nextRole)
              setErrorMessage(null)
            }}
            onSubmit={(email, password) => {
              void handleSubmit(email, password)
            }}
            onRegisterClick={() => {
              setIsRegisterDialogOpen(true)
            }}
          />
        </section>
      </div>

      {isRegisterDialogOpen ? (
        <RegisterTypeDialog
          onClose={closeRegisterDialog}
          onSelectUser={() => {
            setIsRegisterDialogOpen(false)
            void navigate('/register')
          }}
          onSelectMerchant={() => {
            setIsRegisterDialogOpen(false)
            void navigate('/merchant/register')
          }}
        />
      ) : null}
    </main>
  )
}
