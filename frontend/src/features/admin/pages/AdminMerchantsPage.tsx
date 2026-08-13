import {
  useCallback,
  useEffect,
  useState,
  type ReactElement,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getAdminMerchants,
  getAdminMerchantById,
  createAdminMerchant,
  updateAdminMerchant,
  updateAdminMerchantCommission,
  deleteAdminMerchant,
} from '@/features/admin/api/adminApi'
import type {
  AdminMerchant,
  CreateAdminMerchantRequest,
  UpdateAdminMerchantRequest,
} from '@/features/admin/types'
import { isApiError } from '@/shared/api/errors'
import { useAuth } from '@/shared/auth/useAuth'
import { showToast } from '@/shared/ui/toastState'
import '@/features/user/styles/user-dashboard.css'
import '@/features/admin/styles/admin-dashboard.css'

export function AdminMerchantsPage(): ReactElement {
  const navigate = useNavigate()
  const { logout } = useAuth()

  // Data states
  const [merchants, setMerchants] = useState<AdminMerchant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fatalError, setFatalError] = useState<string | null>(null)
  const [isForbidden, setIsForbidden] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  // Search filter state
  const [searchQuery, setSearchQuery] = useState('')

  // Modals / Details states
  const [viewMerchant, setViewMerchant] = useState<AdminMerchant | null>(null)
  const [isViewingLoading, setIsViewingLoading] = useState(false)

  // Create Merchant state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createPhone, setCreatePhone] = useState('')
  const [createCommission, setCreateCommission] = useState('3.00')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Edit Merchant state
  const [editMerchant, setEditMerchant] = useState<AdminMerchant | null>(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updatingError, setUpdatingError] = useState<string | null>(null)

  // Edit Commission state
  const [commissionMerchant, setCommissionMerchant] = useState<AdminMerchant | null>(null)
  const [commissionRate, setCommissionRate] = useState('')
  const [isUpdatingCommission, setIsUpdatingCommission] = useState(false)
  const [commissionError, setCommissionError] = useState<string | null>(null)

  // Delete Merchant state
  const [deleteMerchant, setDeleteMerchant] = useState<AdminMerchant | null>(null)
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

  const loadMerchants = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setFatalError(null)
    setIsForbidden(false)

    try {
      const data = await getAdminMerchants()
      setMerchants(data)
    } catch (err) {
      const msg = handleApiError(err, 'Unable to load merchants list.')
      setFatalError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [handleApiError])

  useEffect(() => {
    void loadMerchants()
  }, [loadMerchants, reloadKey])

  // Filtered merchants
  const filteredMerchants = merchants.filter((m) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      m.merchant_name.toLowerCase().includes(q) ||
      m.id.toString().includes(q) ||
      m.email.toLowerCase().includes(q)
    )
  })

  // View details
  const handleOpenView = async (id: number): Promise<void> => {
    setIsViewingLoading(true)
    try {
      const details = await getAdminMerchantById(id)
      setViewMerchant(details)
    } catch (err) {
      const msg = handleApiError(err, 'Unable to fetch merchant details.')
      showToast(msg, 'error')
    } finally {
      setIsViewingLoading(false)
    }
  }

  // Create Merchant submission
  const handleCreateSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    const trimmedName = createName.trim()
    const trimmedEmail = createEmail.trim()
    const trimmedPassword = createPassword.trim()
    const trimmedPhone = createPhone.trim()

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setCreateError('Name, Email, and Password are required')
      return
    }

    const rate = parseFloat(createCommission)
    if (isNaN(rate) || rate < 3 || rate > 10) {
      setCreateError('Commission rate must be between 3 and 10 percent')
      return
    }

    setIsCreating(true)
    setCreateError(null)
    try {
      const payload: CreateAdminMerchantRequest = {
        merchant_name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
        commission_percentage: rate.toFixed(2),
      }
      if (trimmedPhone) {
        payload.phone_number = trimmedPhone
      }
      await createAdminMerchant(payload)
      showToast('Merchant created successfully', 'success')
      setIsCreateOpen(false)
      // Reset form
      setCreateName('')
      setCreateEmail('')
      setCreatePassword('')
      setCreatePhone('')
      setCreateCommission('3.00')
      // Refresh list
      void loadMerchants()
    } catch (err) {
      const msg = handleApiError(err, 'Unable to create merchant.')
      setCreateError(msg)
    } finally {
      setIsCreating(false)
    }
  }

  // Open Edit Modal
  const handleOpenEdit = (m: AdminMerchant): void => {
    setEditMerchant(m)
    setEditName(m.merchant_name)
    setEditPhone(m.phone_number)
    setUpdatingError(null)
  }

  // Edit Merchant submission
  const handleUpdateSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    if (!editMerchant) return

    const trimmedName = editName.trim()
    if (!trimmedName) {
      setUpdatingError('Name is required')
      return
    }

    setIsUpdating(true)
    setUpdatingError(null)
    try {
      const payload: UpdateAdminMerchantRequest = {
        merchant_name: trimmedName,
      }
      if (editPhone.trim()) {
        payload.phone_number = editPhone.trim()
      }
      await updateAdminMerchant(editMerchant.id, payload)
      showToast('Merchant details updated successfully', 'success')
      setMerchants((prev) =>
        prev.map((m) =>
          m.id === editMerchant.id
            ? { ...m, merchant_name: trimmedName, phone_number: editPhone.trim() }
            : m,
        ),
      )
      setEditMerchant(null)
    } catch (err) {
      const msg = handleApiError(err, 'Unable to update details.')
      setUpdatingError(msg)
    } finally {
      setIsUpdating(false)
    }
  }

  // Open Commission Modal
  const handleOpenCommission = (m: AdminMerchant): void => {
    setCommissionMerchant(m)
    setCommissionRate(m.commission_percentage)
    setCommissionError(null)
  }

  // Update commission rate submission
  const handleCommissionSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    if (!commissionMerchant) return

    const rate = parseFloat(commissionRate)
    if (isNaN(rate) || rate < 3 || rate > 10) {
      setCommissionError('Commission rate must be between 3% and 10%')
      return
    }

    setIsUpdatingCommission(true)
    setCommissionError(null)
    try {
      const formattedRate = rate.toFixed(2)
      await updateAdminMerchantCommission(commissionMerchant.id, {
        commission_percentage: formattedRate,
      })
      showToast('Commission percentage updated successfully', 'success')
      setMerchants((prev) =>
        prev.map((m) =>
          m.id === commissionMerchant.id
            ? { ...m, commission_percentage: formattedRate }
            : m,
        ),
      )
      setCommissionMerchant(null)
    } catch (err) {
      const msg = handleApiError(err, 'Unable to update commission.')
      setCommissionError(msg)
    } finally {
      setIsUpdatingCommission(false)
    }
  }

  // Delete Merchant submission
  const handleDeleteSubmit = async (): Promise<void> => {
    if (!deleteMerchant) return

    setIsDeleting(true)
    setDeletingError(null)
    try {
      await deleteAdminMerchant(deleteMerchant.id)
      showToast('Merchant deleted successfully', 'success')
      setMerchants((prev) => prev.filter((m) => m.id !== deleteMerchant.id))
      setDeleteMerchant(null)
    } catch (err) {
      const msg = handleApiError(err, 'Unable to delete merchant.')
      setDeletingError(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading && merchants.length === 0 && fatalError === null) {
    return (
      <div className="user-dashboard__status" role="status" aria-live="polite">
        <p className="user-dashboard__loading">Loading merchants list…</p>
      </div>
    )
  }

  if (fatalError !== null && merchants.length === 0) {
    return (
      <div className="user-dashboard__error" role="alert">
        <h1 className="user-dashboard__error-title">
          {isForbidden ? 'Access denied' : 'Unable to load merchants'}
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
            <h1 className="user-dashboard__title">Merchants Management</h1>
            <p className="user-dashboard__subtitle">
              Configure business profiles, configure commissions, and handle merchant accounts.
            </p>
          </div>
          <button
            type="button"
            className="user-dashboard__retry"
            style={{ padding: '0.6rem 1.2rem' }}
            onClick={() => setIsCreateOpen(true)}
          >
            + Create Merchant
          </button>
        </div>
      </header>

      <section className="user-dashboard__section" aria-label="Merchants database">
        <div className="admin-users__search-bar">
          <input
            type="search"
            className="admin-users__search-input"
            placeholder="Search by Merchant Name, ID, or Email..."
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredMerchants.length === 0 ? (
          <p className="user-dashboard__empty">No merchants found matching the search criteria.</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="user-dashboard__table-wrap admin-users__table-desktop">
              <table className="user-dashboard__table">
                <thead>
                  <tr>
                    <th scope="col">Merchant ID</th>
                    <th scope="col">Merchant Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Commission %</th>
                    <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMerchants.map((m) => (
                    <tr key={m.id}>
                      <td>{m.id}</td>
                      <td style={{ fontWeight: 'var(--weight-semibold)' }}>{m.merchant_name}</td>
                      <td>{m.email}</td>
                      <td>{m.phone_number || '—'}</td>
                      <td>{m.commission_percentage}%</td>
                      <td>
                        <div className="admin-users__actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="user-dashboard__retry"
                            style={{ padding: '0.35rem 0.6rem', fontSize: 'var(--text-xs)' }}
                            disabled={isViewingLoading}
                            onClick={() => void handleOpenView(m.id)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="user-dashboard__retry"
                            style={{ padding: '0.35rem 0.6rem', fontSize: 'var(--text-xs)', background: 'var(--color-secondary)' }}
                            onClick={() => handleOpenEdit(m)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="user-dashboard__retry"
                            style={{ padding: '0.35rem 0.6rem', fontSize: 'var(--text-xs)', background: 'var(--color-warning)' }}
                            onClick={() => handleOpenCommission(m)}
                          >
                            Rate
                          </button>
                          <button
                            type="button"
                            className="user-dashboard__retry"
                            style={{ padding: '0.35rem 0.6rem', fontSize: 'var(--text-xs)', background: 'var(--color-danger)' }}
                            onClick={() => setDeleteMerchant(m)}
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
              {filteredMerchants.map((m) => (
                <div key={m.id} className="admin-users__card">
                  <div className="admin-users__card-header">
                    <span className="admin-users__card-title">{m.merchant_name}</span>
                    <span className="admin-users__card-id">ID: {m.id}</span>
                  </div>
                  <div className="admin-users__card-body">
                    <div className="admin-users__card-row">
                      <span className="admin-users__card-label">Email</span>
                      <span className="admin-users__card-value">{m.email}</span>
                    </div>
                    <div className="admin-users__card-row">
                      <span className="admin-users__card-label">Phone</span>
                      <span className="admin-users__card-value">{m.phone_number || '—'}</span>
                    </div>
                    <div className="admin-users__card-row">
                      <span className="admin-users__card-label">Commission</span>
                      <span className="admin-users__card-value">{m.commission_percentage}%</span>
                    </div>
                  </div>
                  <div className="admin-users__actions" style={{ marginTop: 'var(--space-2)' }}>
                    <button
                      type="button"
                      className="user-dashboard__retry"
                      style={{ flex: 1, padding: '0.35rem', fontSize: 'var(--text-xs)' }}
                      disabled={isViewingLoading}
                      onClick={() => void handleOpenView(m.id)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="user-dashboard__retry"
                      style={{ flex: 1, padding: '0.35rem', fontSize: 'var(--text-xs)', background: 'var(--color-secondary)' }}
                      onClick={() => handleOpenEdit(m)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="user-dashboard__retry"
                      style={{ flex: 1, padding: '0.35rem', fontSize: 'var(--text-xs)', background: 'var(--color-warning)' }}
                      onClick={() => handleOpenCommission(m)}
                    >
                      Rate
                    </button>
                    <button
                      type="button"
                      className="user-dashboard__retry"
                      style={{ flex: 1, padding: '0.35rem', fontSize: 'var(--text-xs)', background: 'var(--color-danger)' }}
                      onClick={() => setDeleteMerchant(m)}
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

      {/* Create Merchant Modal */}
      {isCreateOpen ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-panel">
            <form onSubmit={(e: FormEvent) => void handleCreateSubmit(e)}>
              <header className="admin-modal-header">
                <h2 className="admin-modal-title">Create Merchant Profile</h2>
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
                  <label className="admin-form-label" htmlFor="create-merchant-name">
                    Merchant Name
                  </label>
                  <input
                    type="text"
                    id="create-merchant-name"
                    className="admin-form-input"
                    value={createName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCreateName(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="create-merchant-email">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="create-merchant-email"
                    className="admin-form-input"
                    value={createEmail}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCreateEmail(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="create-merchant-password">
                    Account Password
                  </label>
                  <input
                    type="password"
                    id="create-merchant-password"
                    className="admin-form-input"
                    value={createPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCreatePassword(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="create-merchant-phone">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="create-merchant-phone"
                    className="admin-form-input"
                    value={createPhone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCreatePhone(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="create-merchant-commission">
                    Commission Percentage (3% – 10%)
                  </label>
                  <input
                    type="number"
                    id="create-merchant-commission"
                    className="admin-form-input"
                    step="0.01"
                    min="3.00"
                    max="10.00"
                    value={createCommission}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCreateCommission(e.target.value)}
                    required
                    disabled={isCreating}
                  />
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
                  {isCreating ? 'Creating...' : 'Create Merchant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* View Merchant Details Modal */}
      {viewMerchant !== null ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-panel">
            <header className="admin-modal-header">
              <h2 className="admin-modal-title">Merchant Details</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setViewMerchant(null)}
              >
                &times;
              </button>
            </header>
            <div className="admin-modal-body">
              <div className="admin-details-list">
                <div className="admin-details-row">
                  <span className="admin-details-label">Merchant ID</span>
                  <span className="admin-details-value">{viewMerchant.id}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Merchant Name</span>
                  <span className="admin-details-value">{viewMerchant.merchant_name}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Email</span>
                  <span className="admin-details-value">{viewMerchant.email}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Phone</span>
                  <span className="admin-details-value">{viewMerchant.phone_number || '—'}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Commission Percentage</span>
                  <span className="admin-details-value">{viewMerchant.commission_percentage}%</span>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="user-dashboard__retry"
                style={{ background: 'var(--color-secondary)' }}
                onClick={() => setViewMerchant(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit Name/Phone Modal */}
      {editMerchant !== null ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-panel">
            <form onSubmit={(e: FormEvent) => void handleUpdateSubmit(e)}>
              <header className="admin-modal-header">
                <h2 className="admin-modal-title">Edit Merchant Profile</h2>
                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() => setEditMerchant(null)}
                >
                  &times;
                </button>
              </header>
              <div className="admin-modal-body">
                {updatingError !== null ? (
                  <p className="admin-dashboard__card-error" style={{ margin: 0 }}>
                    {updatingError}
                  </p>
                ) : null}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="edit-merchant-name">
                    Merchant Name
                  </label>
                  <input
                    type="text"
                    id="edit-merchant-name"
                    className="admin-form-input"
                    value={editName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
                    required
                    disabled={isUpdating}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="edit-merchant-phone">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="edit-merchant-phone"
                    className="admin-form-input"
                    value={editPhone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditPhone(e.target.value)}
                    disabled={isUpdating}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="user-dashboard__retry"
                  style={{ background: 'var(--color-secondary)' }}
                  onClick={() => setEditMerchant(null)}
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
            </form>
          </div>
        </div>
      ) : null}

      {/* Edit Commission Modal */}
      {commissionMerchant !== null ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-panel">
            <form onSubmit={(e: FormEvent) => void handleCommissionSubmit(e)}>
              <header className="admin-modal-header">
                <h2 className="admin-modal-title">Update Commission Rate</h2>
                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() => setCommissionMerchant(null)}
                >
                  &times;
                </button>
              </header>
              <div className="admin-modal-body">
                {commissionError !== null ? (
                  <p className="admin-dashboard__card-error" style={{ margin: 0 }}>
                    {commissionError}
                  </p>
                ) : null}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="edit-commission-rate">
                    Commission Percentage (3% – 10%)
                  </label>
                  <input
                    type="number"
                    id="edit-commission-rate"
                    className="admin-form-input"
                    step="0.01"
                    min="3.00"
                    max="10.00"
                    value={commissionRate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCommissionRate(e.target.value)}
                    required
                    disabled={isUpdatingCommission}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="user-dashboard__retry"
                  style={{ background: 'var(--color-secondary)' }}
                  onClick={() => setCommissionMerchant(null)}
                  disabled={isUpdatingCommission}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="user-dashboard__retry"
                  disabled={isUpdatingCommission}
                >
                  {isUpdatingCommission ? 'Saving...' : 'Update Commission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {deleteMerchant !== null ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-panel">
            <header className="admin-modal-header">
              <h2 className="admin-modal-title" style={{ color: 'var(--color-danger)' }}>
                Delete Merchant
              </h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setDeleteMerchant(null)}
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
                Are you sure you want to delete merchant <strong>{deleteMerchant.merchant_name}</strong> (ID: {deleteMerchant.id})?
                This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="user-dashboard__retry"
                style={{ background: 'var(--color-secondary)' }}
                onClick={() => setDeleteMerchant(null)}
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
                {isDeleting ? 'Deleting...' : 'Delete Merchant'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
