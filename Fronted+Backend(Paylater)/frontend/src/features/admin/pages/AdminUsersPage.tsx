import {
  useCallback,
  useEffect,
  useState,
  type ReactElement,
  type ChangeEvent,
  type FormEvent,
} from 'react'

import {
  getAdminUsers,
  getAdminUserById,
  updateAdminUser,
  deleteAdminUser,
} from '@/features/admin/api/adminApi'
import type { AdminUser } from '@/features/admin/types'
import { formatMoneyDisplay } from '@/shared/lib/money'
import { AdminModal } from '@/features/admin/components/AdminModal'
import { createAdminApiErrorHandler } from '@/features/admin/lib/adminApiError'
import { showToast } from '@/shared/ui/toastState'
import { PageLoadError } from '@/shared/ui/PageLoadError'
import { PageLoadingState } from '@/shared/ui/PageLoadingState'
import '@/shared/styles/page-shell.css'
import '@/features/admin/styles/admin-dashboard.css'

export function AdminUsersPage(): ReactElement {

  // Data states
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fatalError, setFatalError] = useState<string | null>(null)
  const [isForbidden, setIsForbidden] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  // Search filter state
  const [searchQuery, setSearchQuery] = useState('')

  // Modals / Details states
  const [viewUser, setViewUser] = useState<AdminUser | null>(null)
  const [isViewingLoading, setIsViewingLoading] = useState(false)

  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editName, setEditName] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updatingError, setUpdatingError] = useState<string | null>(null)

  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingError, setDeletingError] = useState<string | null>(null)

  const handleApiError = useCallback(createAdminApiErrorHandler(setIsForbidden), [])

  const loadUsers = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setFatalError(null)
    setIsForbidden(false)

    try {
      const data = await getAdminUsers()
      setUsers(data)
    } catch (err) {
      const msg = handleApiError(err, 'Unable to load user list.')
      setFatalError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [handleApiError])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers, reloadKey])

  // Filtered users
  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      user.user_name.toLowerCase().includes(q) ||
      user.id.toString().includes(q)
    )
  })

  // View user details
  const handleOpenView = async (id: number): Promise<void> => {
    setIsViewingLoading(true)
    try {
      const details = await getAdminUserById(id)
      setViewUser(details)
    } catch (err) {
      const msg = handleApiError(err, 'Unable to fetch user details.')
      showToast(msg, 'error')
    } finally {
      setIsViewingLoading(false)
    }
  }

  // Open edit modal
  const handleOpenEdit = (user: AdminUser): void => {
    setEditUser(user)
    setEditName(user.user_name)
    setUpdatingError(null)
  }

  // Update user name
  const handleUpdateSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    if (!editUser) return

    const trimmedName = editName.trim()
    if (!trimmedName) {
      setUpdatingError('Name cannot be empty')
      return
    }

    setIsUpdating(true)
    setUpdatingError(null)
    try {
      await updateAdminUser(editUser.id, { user_name: trimmedName })
      showToast('User name updated successfully!', 'success')
      // Refresh list locally
      setUsers((prev) =>
        prev.map((u) => (u.id === editUser.id ? { ...u, user_name: trimmedName } : u)),
      )
      setEditUser(null)
    } catch (err) {
      const msg = handleApiError(err, 'Unable to update user name.')
      setUpdatingError(msg)
      showToast(msg, 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  // Delete user
  const handleDeleteSubmit = async (): Promise<void> => {
    if (!deleteUser) return

    setIsDeleting(true)
    setDeletingError(null)
    try {
      await deleteAdminUser(deleteUser.id)
      showToast('User deleted successfully!', 'success')
      // Remove from local list
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id))
      setDeleteUser(null)
    } catch (err) {
      const msg = handleApiError(err, 'Unable to delete user.')
      setDeletingError(msg)
      showToast(msg, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading && users.length === 0 && fatalError === null) {
    return <PageLoadingState message="Loading users list…" live />
  }

  if (fatalError !== null && users.length === 0) {
    return (
      <PageLoadError
        title={isForbidden ? 'Access denied' : 'Unable to load users'}
        message={fatalError}
        onRetry={() => setReloadKey((key) => key + 1)}
        showRetry={!isForbidden}
      />
    )
  }

  return (
    <div className="admin-dashboard user-dashboard pl-page">
      <header className="user-dashboard__welcome">
        <p className="user-dashboard__eyebrow admin-dashboard__eyebrow">
          Administration
        </p>
        <h1 className="user-dashboard__title">Users Management</h1>
        <p className="user-dashboard__subtitle">
          Manage registered customer accounts, view limits, and balance dues.
        </p>
      </header>

      <section className="user-dashboard__section" aria-label="Users database">
        <div className="admin-users__search-bar">
          <input
            type="search"
            className="admin-users__search-input"
            placeholder="Search by User Name or ID..."
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredUsers.length === 0 ? (
          <p className="user-dashboard__empty">No users found matching the search criteria.</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="user-dashboard__table-wrap admin-users__table-desktop">
              <table className="user-dashboard__table">
                <thead>
                  <tr>
                    <th scope="col">User ID</th>
                    <th scope="col">User Name</th>
                    <th scope="col">Credit Limit</th>
                    <th scope="col">Current Due</th>
                    <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td style={{ fontWeight: 'var(--weight-semibold)' }}>{user.user_name}</td>
                      <td>{formatMoneyDisplay(user.credit_limit)}</td>
                      <td>
                        <span
                          className={
                            parseFloat(user.current_due) > 0
                              ? 'user-dashboard__type user-dashboard__type--purchase'
                              : ''
                          }
                          style={{ background: parseFloat(user.current_due) > 0 ? 'var(--color-danger-subtle)' : '', color: parseFloat(user.current_due) > 0 ? 'var(--color-danger)' : '' }}
                        >
                          {formatMoneyDisplay(user.current_due)}
                        </span>
                      </td>
                      <td>
                        <div className="admin-users__actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="user-dashboard__retry"
                            style={{ padding: '0.35rem 0.75rem', fontSize: 'var(--text-xs)' }}
                            disabled={isViewingLoading}
                            onClick={() => void handleOpenView(user.id)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="user-dashboard__retry"
                            style={{ padding: '0.35rem 0.75rem', fontSize: 'var(--text-xs)', background: 'var(--color-secondary)' }}
                            onClick={() => handleOpenEdit(user)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="user-dashboard__retry"
                            style={{ padding: '0.35rem 0.75rem', fontSize: 'var(--text-xs)', background: 'var(--color-danger)' }}
                            onClick={() => setDeleteUser(user)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Card View */}
            <div className="admin-users__mobile-cards">
              {filteredUsers.map((user) => (
                <div key={user.id} className="admin-users__card">
                  <div className="admin-users__card-header">
                    <span className="admin-users__card-title">{user.user_name}</span>
                    <span className="admin-users__card-id">ID: {user.id}</span>
                  </div>
                  <div className="admin-users__card-body">
                    <div className="admin-users__card-row">
                      <span className="admin-users__card-label">Credit Limit</span>
                      <span className="admin-users__card-value">{formatMoneyDisplay(user.credit_limit)}</span>
                    </div>
                    <div className="admin-users__card-row">
                      <span className="admin-users__card-label">Current Due</span>
                      <span
                        className="admin-users__card-value"
                        style={{ color: parseFloat(user.current_due) > 0 ? 'var(--color-danger)' : '' }}
                      >
                        {formatMoneyDisplay(user.current_due)}
                      </span>
                    </div>
                  </div>
                  <div className="admin-users__actions" style={{ marginTop: 'var(--space-2)' }}>
                    <button
                      type="button"
                      className="user-dashboard__retry"
                      style={{ flex: 1, padding: '0.35rem', fontSize: 'var(--text-xs)' }}
                      disabled={isViewingLoading}
                      onClick={() => void handleOpenView(user.id)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="user-dashboard__retry"
                      style={{ flex: 1, padding: '0.35rem', fontSize: 'var(--text-xs)', background: 'var(--color-secondary)' }}
                      onClick={() => handleOpenEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="user-dashboard__retry"
                      style={{ flex: 1, padding: '0.35rem', fontSize: 'var(--text-xs)', background: 'var(--color-danger)' }}
                      onClick={() => setDeleteUser(user)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* View User Details Modal */}
      {viewUser !== null ? (
        <AdminModal title="User Details" onClose={() => setViewUser(null)}>
          <div className="admin-modal-body">
            <div className="admin-details-list">
              <div className="admin-details-row">
                <span className="admin-details-label">User ID</span>
                <span className="admin-details-value">{viewUser.id}</span>
              </div>
              <div className="admin-details-row">
                <span className="admin-details-label">User Name</span>
                <span className="admin-details-value">{viewUser.user_name}</span>
              </div>
              <div className="admin-details-row">
                <span className="admin-details-label">Credit Limit</span>
                <span className="admin-details-value">{formatMoneyDisplay(viewUser.credit_limit)}</span>
              </div>
              <div className="admin-details-row">
                <span className="admin-details-label">Current Due</span>
                <span className="admin-details-value">{formatMoneyDisplay(viewUser.current_due)}</span>
              </div>
            </div>
          </div>
          <div className="admin-modal-footer">
            <button
              type="button"
              className="user-dashboard__retry"
              style={{ background: 'var(--color-secondary)' }}
              onClick={() => setViewUser(null)}
            >
              Close
            </button>
          </div>
        </AdminModal>
      ) : null}

      {/* Edit User Name Modal */}
      {editUser !== null ? (
        <AdminModal
          title="Edit User Name"
          onClose={() => setEditUser(null)}
          onSubmit={(e: FormEvent) => void handleUpdateSubmit(e)}
        >
          <div className="admin-modal-body">
            {updatingError !== null ? (
              <p className="admin-dashboard__card-error" style={{ margin: 0 }}>
                {updatingError}
              </p>
            ) : null}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="edit-user-name">
                User Name
              </label>
              <input
                type="text"
                id="edit-user-name"
                className="admin-form-input"
                value={editName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
                required
                disabled={isUpdating}
              />
            </div>
          </div>
          <div className="admin-modal-footer">
            <button
              type="button"
              className="user-dashboard__retry"
              style={{ background: 'var(--color-secondary)' }}
              onClick={() => setEditUser(null)}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="user-dashboard__retry"
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </AdminModal>
      ) : null}

      {/* Delete User Confirmation Modal */}
      {deleteUser !== null ? (
        <AdminModal
          title={
            <span style={{ color: 'var(--color-danger)' }}>Delete User</span>
          }
          onClose={() => setDeleteUser(null)}
        >
          <div className="admin-modal-body">
            {deletingError !== null ? (
              <p className="admin-dashboard__card-error" style={{ margin: 0 }}>
                {deletingError}
              </p>
            ) : null}
            <p className="user-dashboard__subtitle" style={{ color: 'var(--color-text)' }}>
              Are you sure you want to delete user <strong>{deleteUser.user_name}</strong> (ID: {deleteUser.id})?
              This action is permanent and cannot be undone.
            </p>
          </div>
          <div className="admin-modal-footer">
            <button
              type="button"
              className="user-dashboard__retry"
              style={{ background: 'var(--color-secondary)' }}
              onClick={() => setDeleteUser(null)}
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
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </button>
          </div>
        </AdminModal>
      ) : null}
    </div>
  )
}
