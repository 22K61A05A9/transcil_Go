import {
  useId,
  useState,
  type FormEvent,
  type ReactElement,
  type Ref,
} from 'react'

import { RoleSelector } from '@/features/auth/components/RoleSelector'
import type { AuthLoginActor } from '@/features/auth/types'

type LoginFormProps = {
  role: AuthLoginActor
  initialEmail?: string
  isSubmitting: boolean
  errorMessage: string | null
  successMessage: string | null
  registerTriggerRef?: Ref<HTMLButtonElement>
  onRoleChange: (role: AuthLoginActor) => void
  onSubmit: (email: string, password: string) => void
  onRegisterClick: () => void
}

export function LoginForm({
  role,
  initialEmail = '',
  isSubmitting,
  errorMessage,
  successMessage,
  registerTriggerRef,
  onRoleChange,
  onSubmit,
  onRegisterClick,
}: LoginFormProps): ReactElement {
  const emailId = useId()
  const passwordId = useId()
  const errorId = useId()
  const successId = useId()

  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (isSubmitting) {
      return
    }
    onSubmit(email.trim(), password)
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate={false}>
      <div className="login-form__intro">
        <h2 className="login-form__title">Sign in to your account</h2>
        <p className="login-form__hint">
          Choose your account type, then enter your credentials.
        </p>
      </div>

      {successMessage ? (
        <p
          id={successId}
          className="login-form__success"
          role="status"
          aria-live="polite"
        >
          {successMessage}
        </p>
      ) : null}

      <RoleSelector
        value={role}
        disabled={isSubmitting}
        onChange={onRoleChange}
      />

      <div className="login-form__field">
        <label className="login-form__label" htmlFor={emailId}>
          Email
        </label>
        <input
          id={emailId}
          className="login-form__input"
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          placeholder="you@company.com"
          value={email}
          required
          disabled={isSubmitting}
          {...(errorMessage
            ? { 'aria-invalid': true as const, 'aria-describedby': errorId }
            : {})}
          onChange={(event) => {
            setEmail(event.target.value)
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
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            required
            minLength={1}
            disabled={isSubmitting}
            {...(errorMessage
              ? { 'aria-invalid': true as const, 'aria-describedby': errorId }
              : {})}
            onChange={(event) => {
              setPassword(event.target.value)
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

      {errorMessage ? (
        <p
          id={errorId}
          className="login-form__error"
          role="alert"
          aria-live="assertive"
        >
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        className="login-form__submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="login-form__footer">
        Don&apos;t have an account?{' '}
        <button
          ref={registerTriggerRef}
          type="button"
          className="login-form__footer-link"
          disabled={isSubmitting}
          onClick={onRegisterClick}
        >
          Register
        </button>
      </p>
    </form>
  )
}
