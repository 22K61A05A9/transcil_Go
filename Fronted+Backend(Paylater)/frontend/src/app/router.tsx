import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from 'react-router-dom'

import { ProtectedRoute } from '@/app/routing/ProtectedRoute'
import { PublicOnlyRoute } from '@/app/routing/PublicOnlyRoute'
import { RouterRoot } from '@/app/RouterRoot'
import { GUEST_ROUTE_PATHS } from '@/shared/config/guestAccess'
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
import { NotFoundPage } from '@/app/routing/NotFoundPage'
import { AppShell } from '@/shared/layout/AppShell'
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
const routeTable: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={GUEST_ROUTE_PATHS.login} replace />,
  },
  {
    path: GUEST_ROUTE_PATHS.login,
    element: <PublicOnlyRoute />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: GUEST_ROUTE_PATHS.register,
    element: <PublicOnlyRoute />,
    children: [
      {
        index: true,
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: GUEST_ROUTE_PATHS.merchantRegister,
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
        /**no path bcz this is a layout route -- without changing the url it wrap the pages in appshell */
        element: <AppShell />,
        children: [
          { index: true, element: <UserDashboardPage /> },
          { path: 'transactions', element: <UserTransactionsPage /> },
          { path: 'purchase', element: <UserPurchasePage /> },
          { path: 'payback', element: <UserPaybackPage /> },
          { path: 'profile', element: <UserProfilePage /> },
          { path: '*', element: <NotFoundPage /> },
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
          { path: '*', element: <NotFoundPage /> },
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
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage standalone />,
  },
]

export const appRoutes: RouteObject[] = [
  {
    element: <RouterRoot />,
    children: routeTable,
  },
]

export const router = createBrowserRouter(appRoutes)
