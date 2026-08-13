import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from 'react-router-dom'

import { ProtectedRoute } from '@/app/routing/ProtectedRoute'
import { PublicOnlyRoute } from '@/app/routing/PublicOnlyRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { MerchantRegisterPage } from '@/features/auth/pages/MerchantRegisterPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage'
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage'
import { AdminMerchantsPage } from '@/features/admin/pages/AdminMerchantsPage'
import { AdminTransactionsPage } from '@/features/admin/pages/AdminTransactionsPage'
import { AdminReportsPage } from '@/features/admin/pages/AdminReportsPage'
import { AdminAdminsPage } from '@/features/admin/pages/AdminAdminsPage'
import { AdminProfilePage } from '@/features/admin/pages/AdminProfilePage'
import { MerchantDashboardPage } from '@/features/merchant/pages/MerchantDashboardPage'
import { MerchantProfilePage } from '@/features/merchant/pages/MerchantProfilePage'
import { MerchantTransactionsPage } from '@/features/merchant/pages/MerchantTransactionsPage'
import { UserDashboardPage } from '@/features/user/pages/UserDashboardPage'
import { UserPaybackPage } from '@/features/user/pages/UserPaybackPage'
import { UserPurchasePage } from '@/features/user/pages/UserPurchasePage'
import { UserTransactionsPage } from '@/features/user/pages/UserTransactionsPage'
import { UserProfilePage } from '@/features/user/pages/UserProfilePage'
import { AppShell } from '@/shared/ui/layout/AppShell'
import { PlaceholderPage } from '@/shared/ui/PlaceholderPage'
import '@/app/routing/unauthorized.css'

/**
 * Central route table. Nested under role guards so future feature pages
 * can be added as children without repeating auth checks.
 *
 * /merchant/register is declared before /merchant so public registration
 * is not swallowed by the merchant-area splat route.
 *
 * Protected areas nest: ProtectedRoute → AppShell → page Outlet.
 */
export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <PublicOnlyRoute />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/register',
    element: <PublicOnlyRoute />,
    children: [
      {
        index: true,
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: '/merchant/register',
    element: <PublicOnlyRoute />,
    children: [
      {
        index: true,
        element: <MerchantRegisterPage />,
      },
    ],
  },
  {
    path: '/user',
    element: <ProtectedRoute allowedRoles={['user']} />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <UserDashboardPage /> },
          { path: 'transactions', element: <UserTransactionsPage /> },
          { path: 'purchase', element: <UserPurchasePage /> },
          { path: 'payback', element: <UserPaybackPage /> },
          { path: 'profile', element: <UserProfilePage /> },
          { path: '*', element: <UserDashboardPage /> },
        ],
      },
    ],
  },
  {
    path: '/merchant',
    element: <ProtectedRoute allowedRoles={['merchant']} />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <MerchantDashboardPage /> },
          { path: 'transactions', element: <MerchantTransactionsPage /> },
          { path: 'profile', element: <MerchantProfilePage /> },
          { path: '*', element: <MerchantDashboardPage /> },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'merchants', element: <AdminMerchantsPage /> },
          { path: 'transactions', element: <AdminTransactionsPage /> },
          { path: 'reports', element: <AdminReportsPage /> },
          { path: 'admins', element: <AdminAdminsPage /> },
          { path: 'profile', element: <AdminProfilePage /> },
          { path: '*', element: <AdminDashboardPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <PlaceholderPage title="404 - Not Found" description="The page you are looking for does not exist." />,
  },
]

export const router = createBrowserRouter(appRoutes)
