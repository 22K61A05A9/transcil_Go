import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect } from 'vitest'

// Mock useAuth
const mockLogout = vi.fn()
const mockLogin = vi.fn()
vi.mock('@/shared/auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    userId: 1,
    role: 'user',
    token: 'fake-token',
    login: mockLogin,
    logout: mockLogout,
    session: { token: 'fake-token', userId: 1, role: 'user' },
  }),
}))

// Mock APIs
vi.mock('@/features/user/api/userApi', () => ({
  getUserById: vi.fn().mockResolvedValue({
    id: 1,
    user_name: 'John Doe',
    credit_limit: '1000.00',
    current_due: '150.00',
  }),
  getUserTransactions: vi.fn().mockResolvedValue([
    {
      id: 1,
      user_id: 1,
      merchant_id: { Int32: 2, Valid: true },
      transaction_type: 'PURCHASE',
      amount: '50.00',
      commission: '2.50',
      commission_percentage: '5.00',
    },
  ]),
}))

vi.mock('@/features/merchant/api/merchantApi', () => ({
  getMerchantById: vi.fn().mockResolvedValue({
    id: 2,
    merchant_name: 'Test Merchant',
    email: 'merchant@example.com',
    phone_number: '9876543210',
    commission_percentage: '5.00',
  }),
  getMerchantTransactions: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/features/admin/api/adminApi', () => ({
  getAdminById: vi.fn().mockResolvedValue({
    id: 3,
    admin_name: 'Admin User',
    email: 'admin@example.com',
    role: 'SUPER_ADMIN',
  }),
  getTotalDue: vi.fn().mockResolvedValue({ total_due: '2000.00' }),
  getUsersAtCreditLimit: vi.fn().mockResolvedValue([]),
  getCustomersWithDue: vi.fn().mockResolvedValue([]),
  getAdminTransactions: vi.fn().mockResolvedValue([]),
}))

// Import Pages
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { UserDashboardPage } from '@/features/user/pages/UserDashboardPage'
import { MerchantDashboardPage } from '@/features/merchant/pages/MerchantDashboardPage'
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage'

describe('PayLater Monorepo Frontend Smoke Tests', () => {
  it('renders the Login Page successfully', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy()
  })

  it('renders the User Dashboard Page successfully', async () => {
    render(
      <MemoryRouter>
        <UserDashboardPage />
      </MemoryRouter>
    )
    expect(await screen.findByText(/make purchase/i)).toBeTruthy()
  })

  it('renders the Merchant Dashboard Page successfully', async () => {
    render(
      <MemoryRouter>
        <MerchantDashboardPage />
      </MemoryRouter>
    )
    expect(await screen.findByText(/merchant dashboard/i)).toBeTruthy()
  })

  it('renders the Admin Dashboard Page successfully', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    )
    expect(await screen.findByText(/administration/i)).toBeTruthy()
  })
})
