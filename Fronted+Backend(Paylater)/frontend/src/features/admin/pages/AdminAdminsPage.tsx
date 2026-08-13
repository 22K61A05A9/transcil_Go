import {
  useCallback,
  useEffect,
  useState,
  type ReactElement,
  type FormEvent,
  type ChangeEvent,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  getAdmins,
  getAdminById,
  createAdmin,
  deleteAdmin,
} from '@/features/admin/api/adminApi'
import type { AdminProfile, AdminRole } from '@/features/admin/types'
import { isApiError } from '@/shared/api/errors'
import { useAuth } from '@/shared/auth/useAuth'
import { showToast } from '@/shared/ui/toastState'
import '@/features/user/styles/user-dashboard.css'
import '@/features/admin/styles/admin-dashboard.css'

export function AdminAdminsPage(): ReactElement {
  const navigate = useNavigate()
  const { role, userId, logout } = useAuth()
  const isSuperAdmin = role === 'SUPER_ADMIN'

  // Data states
  const [admins, setAdmins] = useState<AdminProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fatalError, setFatalError] = useState<string | null>(null)
  const [isForbidden, setIsForbidden] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  // Search filter state
  const [searchQuery, setSearchQuery] = useState('')

  // Modals / Details states
  const [viewAdmin, setViewAdmin] = useState<AdminProfile | null>(null)
  const [isViewingLoading, setIsViewingLoading] = useState(false)

  // Create Admin state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createRole, setCreateRole] = useState<AdminRole>('ADMIN')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Delete Admin state
  const [deleteAdminObj, setDeleteAdminObj] = useState<AdminProfile | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingError, setDeletingError] = useState<string | null>(null)

  const handleApiError = useCallback((error: unknown, fallback: string): string => {
    if (isApiError(error)) {
      if (error.status === 401) {
        logout()
        void navigate('/login', { replace: true })
        return 'Session expired. Logging out...'
      }
      if (error.status === 403) {
        setIsForbidden(true)
        return 'Access denied. You do not have permissions for this resource.'
      }
      if (error.status === 0) {
        return 'Unable to reach the server. Check your connection.'
      }
      return error.message || fallback
    }
    return fallback
  }, [logout, navigate])

  const loadAdmins = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setFatalError(null)
    setIsForbidden(false)

    try {
      const data = await getAdmins()
      setAdmins(data)
    } catch (err) {
      const msg = handleApiError(err, 'Unable to load admin accounts.')
      setFatalError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [handleApiError])

  useEffect(() => {
    void loadAdmins()
  }, [loadAdmins, reloadKey])

  // Filtered admins
  const filteredAdmins = admins.filter((a) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      a.admin_name.toLowerCase().includes(q) ||
      a.id.toString().includes(q) ||
      a.email.toLowerCase().includes(q)
    )
  })

  // View details
  const handleOpenView = async (id: number): Promise<void> => {
    setIsViewingLoading(true)
    try {
      const details = await getAdminById(id)
      setViewAdmin(details)
    } catch (err) {
      const msg = handleApiError(err, 'Unable to fetch admin details.')
      showToast(msg, 'error')
    } finally {
      setIsViewingLoading(false)
    }
  }

  // Create Admin submission (SUPER_ADMIN only)
  const handleCreateSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    if (!isSuperAdmin) return

    const trimmedName = createName.trim()
    const trimmedEmail = createEmail.trim()
    const trimmedPassword = createPassword.trim()

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setCreateError('Name, Email, and Password are required')
      return
    }

    setIsCreating(true)
    setCreateError(null)
    try {
      await createAdmin({
        admin_name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
        role: createRole,
      })
      showToast('Admin account created successfully', 'success')
      setIsCreateOpen(false)
      // Reset form
      setCreateName('')
      setCreateEmail('')
      setCreatePassword('')
      setCreateRole('ADMIN')
      // Refresh list
      void loadAdmins()
    } catch (err) {
      const msg = handleApiError(err, 'Unable to create admin.')
      setCreateError(msg)
    } finally {
      setIsCreating(false)
    }
  }

  // Delete Admin submission (SUPER_ADMIN only)
  const handleDeleteSubmit = async (): Promise<void> => {
    if (!deleteAdminObj || !isSuperAdmin) return

    setIsDeleting(true)
    setDeletingError(null)
    try {
      await deleteAdmin(deleteAdminObj.id)
      showToast('Admin account deleted successfully', 'success')
      setAdmins((prev) => prev.filter((a) => a.id !== deleteAdminObj.id))
      setDeleteAdminObj(null)
    } catch (err) {
      const msg = handleApiError(err, 'Unable to delete admin.')
      setDeletingError(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading && admins.length === 0 && fatalError === null) {
    return (
      <div className="user-dashboard__status" role="status" aria-live="polite">
        <p className="user-dashboard__loading">Loading administrator accounts…</p>
      </div>
    )
  }

  if (fatalError !== null && admins.length === 0) {
    return (
      <div className="user-dashboard__error" role="alert">
        <h1 className="user-dashboard__error-title">
          {isForbidden ? 'Access denied' : 'Unable to load admins'}
        </h1>
        <p className="user-dashboard__error-message">{fatalError}</p>
        {!isForbidden ? (
          <button
            type="button"
            className="user-dashboard__retry"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Retry
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="admin-dashboard user-dashboard">
      <header className="user-dashboard__welcome">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <p className="user-dashboard__eyebrow admin-dashboard__eyebrow">
              Administration
            </p>
            <h1 className="user-dashboard__title">Admin Management</h1>
            <p className="user-dashboard__subtitle">
              Manage platform operations, roles, and administrative staff accounts.
              {!isSuperAdmin ? (
                <>
                  {' '}
                  Only Super Admins can create or delete accounts.{' '}
                  <Link to="/admin/profile">View your profile</Link>.
                </>
              ) : null}
            </p>
          </div>
          {isSuperAdmin ? (
            <button
              type="button"
              className="user-dashboard__retry"
              style={{ padding: '0.6rem 1.2rem' }}
              onClick={() => setIsCreateOpen(true)}
            >
              + Create Admin
            </button>
          ) : null}
        </div>
      </header>

      <section className="user-dashboard__section" aria-label="Admins database">
        <div className="admin-users__search-bar">
          <input
            type="search"
            className="admin-users__search-input"
            placeholder="Search by Admin Name, ID, or Email..."
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredAdmins.length === 0 ? (
          <p className="user-dashboard__empty">No admins found matching the search criteria.</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="user-dashboard__table-wrap admin-users__table-desktop">
              <table className="user-dashboard__table">
                <thead>
                  <tr>
                    <th scope="col">Admin ID</th>
                    <th scope="col">Admin Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Role</th>
                    <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((a) => (
                    <tr key={a.id}>
                      <td>{a.id}</td>
                      <td style={{ fontWeight: 'var(--weight-semibold)' }}>{a.admin_name}</td>
                      <td>{a.email}</td>
                      <td>
                        <span
                          className="user-dashboard__type"
                          style={{
                            background: a.role === 'SUPER_ADMIN' ? 'var(--color-primary-subtle)' : 'var(--color-surface-muted)',
                            color: a.role === 'SUPER_ADMIN' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            fontWeight: 'var(--weight-semibold)'
                          }}
                        >
                          {a.role}
                        </span>
                      </td>
                      <td>
                        <div className="admin-users__actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="user-dashboard__retry"
                            style={{ padding: '0.35rem 0.65rem', fontSize: 'var(--text-xs)' }}
                            disabled={isViewingLoading}
                            onClick={() => void handleOpenView(a.id)}
                          >
                            View
                          </button>
                          {isSuperAdmin && a.id !== userId ? (
                            <button
                              type="button"
                              className="user-dashboard__retry"
                              style={{ padding: '0.35rem 0.65rem', fontSize: 'var(--text-xs)', background: 'var(--color-danger)' }}
                              onClick={() => setDeleteAdminObj(a)}
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Card View */}
            <div className="admin-users__mobile-cards">
              {filteredAdmins.map((a) => (
                <div key={a.id} className="admin-users__card">
                  <div className="admin-users__card-header">
                    <span className="admin-users__card-title">{a.admin_name}</span>
                    <span className="admin-users__card-id">ID: {a.id}</span>
                  </div>
                  <div className="admin-users__card-body">
                    <div className="admin-users__card-row">
                      <span className="admin-users__card-label">Email</span>
                      <span className="admin-users__card-value">{a.email}</span>
                    </div>
                    <div className="admin-users__card-row">
                      <span className="admin-users__card-label">Role</span>
                      <span
                        className="admin-users__card-value"
                        style={{
                          color: a.role === 'SUPER_ADMIN' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                          fontWeight: 'var(--weight-semibold)'
                        }}
                      >
                        {a.role}
                      </span>
                    </div>
                  </div>
                  <div className="admin-users__actions" style={{ marginTop: 'var(--space-2)' }}>
                    <button
                      type="button"
                      className="user-dashboard__retry"
                      style={{ flex: 1, padding: '0.35rem', fontSize: 'var(--text-xs)' }}
                      disabled={isViewingLoading}
                      onClick={() => void handleOpenView(a.id)}
                    >
                      View Details
                    </button>
                    {isSuperAdmin && a.id !== userId ? (
                      <button
                        type="button"
                        className="user-dashboard__retry"
                        style={{ flex: 1, padding: '0.35rem', fontSize: 'var(--text-xs)', background: 'var(--color-danger)' }}
                        onClick={() => setDeleteAdminObj(a)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Create Admin Modal (SUPER_ADMIN only) */}
      {isCreateOpen && isSuperAdmin ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-panel">
            <form onSubmit={(e: FormEvent) => void handleCreateSubmit(e)}>
              <header className="admin-modal-header">
                <h2 className="admin-modal-title">Create Admin Account</h2>
                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() => setIsCreateOpen(false)}
                >
                  &times;
                </button>
              </header>
              <div className="admin-modal-body">
                {createError !== null ? (
                  <p className="admin-dashboard__card-error" style={{ margin: 0 }}>
                    {createError}
                  </p>
                ) : null}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="create-admin-name">
                    Name
                  </label>
                  <input
                    type="text"
                    id="create-admin-name"
                    className="admin-form-input"
                    value={createName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCreateName(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="create-admin-email">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="create-admin-email"
                    className="admin-form-input"
                    value={createEmail}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCreateEmail(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="create-admin-password">
                    Password
                  </label>
                  <input
                    type="password"
                    id="create-admin-password"
                    className="admin-form-input"
                    value={createPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCreatePassword(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="create-admin-role">
                    Role Privilege
                  </label>
                  <select
                    id="create-admin-role"
                    className="admin-form-input"
                    value={createRole}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setCreateRole(e.target.value as AdminRole)}
                    disabled={isCreating}
                    required
                  >
                    <option value="ADMIN">ADMIN (Read-Only Management)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Full Write Privileges)</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="user-dashboard__retry"
                  style={{ background: 'var(--color-secondary)' }}
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="user-dashboard__retry"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* View Admin Details Modal */}
      {viewAdmin !== null ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-panel">
            <header className="admin-modal-header">
              <h2 className="admin-modal-title">Admin Account Details</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setViewAdmin(null)}
              >
                &times;
              </button>
            </header>
            <div className="admin-modal-body">
              <div className="admin-details-list">
                <div className="admin-details-row">
                  <span className="admin-details-label">Admin ID</span>
                  <span className="admin-details-value">{viewAdmin.id}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Name</span>
                  <span className="admin-details-value">{viewAdmin.admin_name}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Email</span>
                  <span className="admin-details-value">{viewAdmin.email}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Privilege Level</span>
                  <span className="admin-details-value" style={{ fontWeight: 'var(--weight-semibold)' }}>{viewAdmin.role}</span>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="user-dashboard__retry"
                style={{ background: 'var(--color-secondary)' }}
                onClick={() => setViewAdmin(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal (SUPER_ADMIN only) */}
      {deleteAdminObj !== null && isSuperAdmin ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-panel">
            <header className="admin-modal-header">
              <h2 className="admin-modal-title" style={{ color: 'var(--color-danger)' }}>
                Delete Administrator Account
              </h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setDeleteAdminObj(null)}
              >
                &times;
              </button>
            </header>
            <div className="admin-modal-body">
              {deletingError !== null ? (
                <p className="admin-dashboard__card-error" style={{ margin: 0 }}>
                  {deletingError}
                </p>
              ) : null}
              <p className="user-dashboard__subtitle" style={{ color: 'var(--color-text)' }}>
                Are you sure you want to delete administrator account <strong>{deleteAdminObj.admin_name}</strong> (ID: {deleteAdminObj.id})?
                This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="user-dashboard__retry"
                style={{ background: 'var(--color-secondary)' }}
                onClick={() => setDeleteAdminObj(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="user-dashboard__retry"
                style={{ background: 'var(--color-danger)' }}
                onClick={() => void handleDeleteSubmit()}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Admin'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
