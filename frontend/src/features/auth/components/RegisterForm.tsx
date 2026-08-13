import {
  useId,
  useState,
  type FormEvent,
  type ReactElement,
} from 'react'
import { Link } from 'react-router-dom'

import type { RegisterUserRequest } from '@/features/auth/types'

type RegisterFormProps = {
  isSubmitting: boolean
  errorMessage: string | null
  onSubmit: (payload: RegisterUserRequest) => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateForm(values: {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}): string | null {
  const fullName = values.fullName.trim()
  if (fullName === '') {
    return 'Full name is required.'
  }

  const email = values.email.trim()
  if (email === '') {
    return 'Email is required.'
  }
  if (!EMAIL_PATTERN.test(email)) {
    return 'Enter a valid email address.'
  }

  if (values.password.trim() === '') {
    return 'Password is required.'
  }
  if (values.password.length < 6) {
    return 'Password must be at least 6 characters.'
  }

  if (values.confirmPassword.trim() === '') {
    return 'Confirm your password.'
  }
  if (values.password !== values.confirmPassword) {
    return 'Password and confirm password must match.'
  }

  return null
}

export function RegisterForm({
  isSubmitting,
  errorMessage,
  onSubmit,
}: RegisterFormProps): ReactElement {
  const nameId = useId()
  const emailId = useId()
  const passwordId = useId()
  const confirmId = useId()
  const errorId = useId()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)

  const displayError = clientError ?? errorMessage

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const validationError = validateForm({
      fullName,
      email,
      password,
      confirmPassword,
    })
    if (validationError) {
      setClientError(validationError)
      return
    }

    setClientError(null)
    onSubmit({
      user_name: fullName.trim(),
      email: email.trim(),
      password,
    })
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="login-form__intro">
        <h2 className="login-form__title">Create your account</h2>
        <p className="login-form__hint">
          After registration you will sign in with your user credentials.
        </p>
      </div>

      <div className="login-form__field">
        <label className="login-form__label" htmlFor={nameId}>
          Full name
        </label>
        <input
          id={nameId}
          className="login-form__input"
          type="text"
          name="user_name"
          autoComplete="name"
          placeholder="Alex Johnson"
          value={fullName}
          required
          disabled={isSubmitting}
          onChange={(event) => {
            setFullName(event.target.value)
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
          placeholder="you@company.com"
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
            placeholder="At least 6 characters"
            value={password}
            required
            minLength={6}
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
            minLength={6}
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
        {isSubmitting ? 'Creating account…' : 'Create account'}
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
