import type { ReactElement } from 'react'

import type { AuthLoginActor } from '@/features/auth/types'

type RoleOption = {
  value: AuthLoginActor
  label: string
  description: string
}

const ROLE_OPTIONS: readonly RoleOption[] = [
  {
    value: 'user',
    label: 'User',
    description: 'Customer account',
  },
  {
    value: 'merchant',
    label: 'Merchant',
    description: 'Merchant account',
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Operations account',
  },
] as const

type RoleSelectorProps = {
  value: AuthLoginActor
  disabled?: boolean
  onChange: (role: AuthLoginActor) => void
}

export function RoleSelector({
  value,
  disabled = false,
  onChange,
}: RoleSelectorProps): ReactElement {
  return (
    <fieldset className="role-selector" disabled={disabled}>
      <legend className="role-selector__legend">Account type</legend>
      <div
        className="role-selector__options"
        role="radiogroup"
        aria-label="Account type"
      >
        {ROLE_OPTIONS.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              className={
                selected
                  ? 'role-selector__option role-selector__option--selected'
                  : 'role-selector__option'
              }
              onClick={() => {
                onChange(option.value)
              }}
            >
              <span className="role-selector__option-label">{option.label}</span>
              <span className="role-selector__option-desc">
                {option.description}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
