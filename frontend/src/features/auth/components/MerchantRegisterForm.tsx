import {
  useId,
  useState,
  type FormEvent,
  type ReactElement,
} from 'react'
import { Link } from 'react-router-dom'

import type { RegisterMerchantRequest } from '@/features/auth/types'

export type MerchantRegisterFormValues = {
  merchantName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
  commissionPercentage: string
}

type MerchantRegisterFormProps = {
  isSubmitting: boolean
  errorMessage: string | null
  onSubmit: (payload: RegisterMerchantRequest) => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[+\d][\d\s()-]{6,19}$/

function validateForm(values: MerchantRegisterFormValues): string | null {
  const merchantName = values.merchantName.trim()
  if (merchantName === '') {
    return 'Merchant name is required.'
  }

  const email = values.email.trim()
  if (email === '') {
    return 'Email is required.'
  }
  if (!EMAIL_PATTERN.test(email)) {
    return 'Enter a valid email address.'
  }

  const phone = values.phoneNumber.trim()
  if (phone !== '' && !PHONE_PATTERN.test(phone)) {
    return 'Enter a valid phone number, or leave it blank.'
  }

  if (values.password.trim() === '') {
    return 'Password is required.'
  }

  if (values.confirmPassword.trim() === '') {
    return 'Confirm your password.'
  }
  if (values.password !== values.confirmPassword) {
    return 'Password and confirm password must match.'
  }

  const commissionRaw = values.commissionPercentage.trim()
  if (commissionRaw === '') {
    return 'Commission percentage is required.'
  }
  const commission = Number(commissionRaw)
  if (!Number.isFinite(commission)) {
    return 'Commission percentage must be a number.'
  }
  if (commission < 3 || commission > 10) {
    return 'Commission percentage must be between 3 and 10.'
  }

  return null
}

export function MerchantRegisterForm({
  isSubmitting,
  errorMessage,
  onSubmit,
}: MerchantRegisterFormProps): ReactElement {
  const nameId = useId()
  const emailId = useId()
  const phoneId = useId()
  const passwordId = useId()
  const confirmId = useId()
  const commissionId = useId()
  const errorId = useId()
  const commissionHelpId = useId()

  const [merchantName, setMerchantName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [commissionPercentage, setCommissionPercentage] = useState('5')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)

  const displayError = clientError ?? errorMessage

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const values: MerchantRegisterFormValues = {
      merchantName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      commissionPercentage,
    }

    const validationError = validateForm(values)
    if (validationError) {
      setClientError(validationError)
      return
    }

    setClientError(null)

    const phone = phoneNumber.trim()
    const payload: RegisterMerchantRequest = {
      merchant_name: merchantName.trim(),
      email: email.trim(),
      password,
      commission_percentage: commissionPercentage.trim(),
      ...(phone !== '' ? { phone_number: phone } : {}),
    }

    onSubmit(payload)
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="login-form__intro">
        <h2 className="login-form__title">Create your merchant account</h2>
        <p className="login-form__hint">
          After registration you will sign in with your merchant credentials.
        </p>
      </div>

      <div className="login-form__field">
        <label className="login-form__label" htmlFor={nameId}>
          Merchant Name
        </label>
        <input
          id={nameId}
          className="login-form__input"
          type="text"
          name="merchant_name"
          autoComplete="organization"
          placeholder="Acme Retail"
          value={merchantName}
          required
          disabled={isSubmitting}
          onChange={(event) => {
            setMerchantName(event.target.value)
            setClientError(null)
          }}
        />
      </div>

      <div className="login-form__field">
        <label className="login-form__label" htmlFor={emailId}>
          Email
        </label>
        <input
          id={emailId}
          className="login-form__input"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="merchant@company.com"
          value={email}
          required
          disabled={isSubmitting}
          onChange={(event) => {
            setEmail(event.target.value)
            setClientError(null)
          }}
        />
      </div>

      <div className="login-form__field">
        <label className="login-form__label" htmlFor={phoneId}>
          Phone Number <span className="login-form__optional">(optional)</span>
        </label>
        <input
          id={phoneId}
          className="login-form__input"
          type="tel"
          name="phone_number"
          autoComplete="tel"
          placeholder="+91 98765 43210"
          value={phoneNumber}
          disabled={isSubmitting}
          onChange={(event) => {
            setPhoneNumber(event.target.value)
            setClientError(null)
          }}
        />
      </div>

      <div className="login-form__field">
        <label className="login-form__label" htmlFor={passwordId}>
          Password
        </label>
        <div className="login-form__password-row">
          <input
            id={passwordId}
            className="login-form__input login-form__input--password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            required
            disabled={isSubmitting}
            onChange={(event) => {
              setPassword(event.target.value)
              setClientError(null)
            }}
          />
          <button
            type="button"
            className="login-form__visibility"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            disabled={isSubmitting}
            onClick={() => {
              setShowPassword((current) => !current)
            }}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div className="login-form__field">
        <label className="login-form__label" htmlFor={confirmId}>
          Confirm Password
        </label>
        <div className="login-form__password-row">
          <input
            id={confirmId}
            className="login-form__input login-form__input--password"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirm_password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            required
            disabled={isSubmitting}
            onChange={(event) => {
              setConfirmPassword(event.target.value)
              setClientError(null)
            }}
          />
          <button
            type="button"
            className="login-form__visibility"
            aria-label={
              showConfirmPassword
                ? 'Hide confirm password'
                : 'Show confirm password'
            }
            aria-pressed={showConfirmPassword}
            disabled={isSubmitting}
            onClick={() => {
              setShowConfirmPassword((current) => !current)
            }}
          >
            {showConfirmPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div className="login-form__field">
        <label className="login-form__label" htmlFor={commissionId}>
          Commission Percentage
        </label>
        <input
          id={commissionId}
          className="login-form__input"
          type="number"
          name="commission_percentage"
          min={3}
          max={10}
          step="0.01"
          inputMode="decimal"
          placeholder="5"
          value={commissionPercentage}
          required
          disabled={isSubmitting}
          aria-describedby={commissionHelpId}
          onChange={(event) => {
            setCommissionPercentage(event.target.value)
            setClientError(null)
          }}
        />
        <p id={commissionHelpId} className="login-form__field-help">
          Choose a commission percentage between 3% and 10%.
        </p>
      </div>

      {displayError ? (
        <p
          id={errorId}
          className="login-form__error"
          role="alert"
          aria-live="assertive"
        >
          {displayError}
        </p>
      ) : null}

      <button
        type="submit"
        className="login-form__submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Creating merchant account…' : 'Create merchant account'}
      </button>

      <p className="login-form__footer">
        Already have an account?{' '}
        <Link className="login-form__footer-link" to="/login">
          Sign in
        </Link>
      </p>
    </form>
  )
}
