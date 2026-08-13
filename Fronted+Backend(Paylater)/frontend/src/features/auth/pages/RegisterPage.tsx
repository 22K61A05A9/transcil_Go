import { useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'

import { registerUser } from '@/features/auth/api/authApi'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { RegisterHeader } from '@/features/auth/components/RegisterHeader'
import { getUserRegisterErrorMessage } from '@/features/auth/lib/userRegisterErrors'
import type {
  LoginNavigationState,
  RegisterUserRequest,
} from '@/features/auth/types'
import '@/features/auth/styles/login.css'

export function RegisterPage(): ReactElement {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(payload: RegisterUserRequest): Promise<void> {
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      await registerUser(payload)

      const loginState: LoginNavigationState = {
        registeredEmail: payload.email,
        registeredActor: 'user',
        registrationSuccess: true,
      }

      void navigate('/login', { replace: true, state: loginState })
    } catch (error) {
      setErrorMessage(getUserRegisterErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-page__shell">
        <RegisterHeader />
        <section className="login-page__card" aria-label="User registration">
          <RegisterForm
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            onSubmit={(payload) => {
              void handleSubmit(payload)
            }}
          />
        </section>
      </div>
    </main>
  )
}
