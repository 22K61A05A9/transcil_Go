import { useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'

import { registerMerchant } from '@/features/auth/api/authApi'
import { MerchantRegisterForm } from '@/features/auth/components/MerchantRegisterForm'
import { MerchantRegisterHeader } from '@/features/auth/components/MerchantRegisterHeader'
import { getMerchantRegisterErrorMessage } from '@/features/auth/lib/merchantRegisterErrors'
import type {
  LoginNavigationState,
  RegisterMerchantRequest,
} from '@/features/auth/types'
import '@/features/auth/styles/login.css'

export function MerchantRegisterPage(): ReactElement {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(payload: RegisterMerchantRequest): Promise<void> {
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      await registerMerchant(payload)

      const loginState: LoginNavigationState = {
        registeredEmail: payload.email,
        registeredActor: 'merchant',
        registrationSuccess: true,
      }

      void navigate('/login', { replace: true, state: loginState })
    } catch (error) {
      setErrorMessage(getMerchantRegisterErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-page__shell login-page__shell--wide">
        <MerchantRegisterHeader />
        <section className="login-page__card" aria-label="Merchant registration">
          <MerchantRegisterForm
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
