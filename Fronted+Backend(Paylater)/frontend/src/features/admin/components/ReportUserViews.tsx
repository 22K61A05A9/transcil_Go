import type { ReactElement } from 'react'

import type { ReportUserRow } from '@/features/admin/types'
import { formatMoneyDisplay } from '@/shared/lib/money'

type ReportUserViewVariant = 'default' | 'reports'

type ReportUserViewProps = {
  rows: ReportUserRow[]
  emptyMessage: string
  variant?: ReportUserViewVariant
}

const LABELS = {
  default: {
    creditLimit: 'Credit Limit',
    currentDue: 'Current Due',
    creditLimitHeader: 'Credit Limit',
    currentDueHeader: 'Current Due',
    userNameHeader: 'User Name',
  },
  reports: {
    creditLimit: 'Credit limit',
    currentDue: 'Current due',
    creditLimitHeader: 'Credit limit',
    currentDueHeader: 'Current due',
    userNameHeader: 'User name',
  },
} as const

export function ReportUserTable({
  rows,
  emptyMessage,
  variant = 'default',
}: ReportUserViewProps): ReactElement {
  const labels = LABELS[variant]

  if (rows.length === 0) {
    return <p className="user-dashboard__empty">{emptyMessage}</p>
  }

  return (
    <div className="user-dashboard__table-wrap admin-users__table-desktop">
      <table
        className={
          variant === 'reports'
            ? 'user-dashboard__table admin-reports__table'
            : 'user-dashboard__table'
        }
      >
        <thead>
          <tr>
            <th scope="col">User ID</th>
            <th scope="col">{labels.userNameHeader}</th>
            <th scope="col">{labels.creditLimitHeader}</th>
            <th scope="col">{labels.currentDueHeader}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td
                className={
                  variant === 'reports' ? 'admin-reports__name-cell' : undefined
                }
              >
                {row.user_name}
              </td>
              <td>{formatMoneyDisplay(row.credit_limit)}</td>
              <td
                className={
                  variant === 'reports' ? 'admin-reports__due-cell' : undefined
                }
              >
                {formatMoneyDisplay(row.current_due)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ReportUserCards({
  rows,
  emptyMessage,
  variant = 'default',
}: ReportUserViewProps): ReactElement {
  const labels = LABELS[variant]

  if (rows.length === 0) {
    return <p className="user-dashboard__empty">{emptyMessage}</p>
  }

  return (
    <div className="admin-users__mobile-cards">
      {rows.map((row) => (
        <div key={row.id} className="admin-users__card">
          <div className="admin-users__card-header">
            <span className="admin-users__card-title">{row.user_name}</span>
            <span className="admin-users__card-id">ID: {row.id}</span>
          </div>
          <div className="admin-users__card-body">
            <div className="admin-users__card-row">
              <span className="admin-users__card-label">{labels.creditLimit}</span>
              <span className="admin-users__card-value">
                {formatMoneyDisplay(row.credit_limit)}
              </span>
            </div>
            <div className="admin-users__card-row">
              <span className="admin-users__card-label">{labels.currentDue}</span>
              <span className="admin-users__card-value">
                {formatMoneyDisplay(row.current_due)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
