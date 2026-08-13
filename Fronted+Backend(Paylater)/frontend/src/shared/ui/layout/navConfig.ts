import type { AuthRole } from '@/shared/auth/types'

export type AppNavItem = {
  label: string
  path: string
  roles: readonly AuthRole[]
}

/**
 * Navigation items for existing routes only.
 * Do not add paths that are not registered in the router.
 */
export const APP_NAV_ITEMS: readonly AppNavItem[] = [
  {
    label: 'Home',
    path: '/user',
    roles: ['user'],
  },
  {
    label: 'Transactions',
    path: '/user/transactions',
    roles: ['user'],
  },
  {
    label: 'Purchase',
    path: '/user/purchase',
    roles: ['user'],
  },
  {
    label: 'Pay Back',
    path: '/user/payback',
    roles: ['user'],
  },
  {
    label: 'Profile',
    path: '/user/profile',
    roles: ['user'],
  },
  {
    label: 'Home',
    path: '/merchant',
    roles: ['merchant'],
  },
  {
    label: 'Transactions',
    path: '/merchant/transactions',
    roles: ['merchant'],
  },
  {
    label: 'Profile',
    path: '/merchant/profile',
    roles: ['merchant'],
  },
  {
    label: 'Home',
    path: '/admin',
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    label: 'Users',
    path: '/admin/users',
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    label: 'Merchants',
    path: '/admin/merchants',
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    label: 'Transactions',
    path: '/admin/transactions',
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    label: 'Reports',
    path: '/admin/reports',
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    label: 'Admins',
    path: '/admin/admins',
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    label: 'Profile',
    path: '/admin/profile',
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
] as const

export function getNavItemsForRole(role: AuthRole): AppNavItem[] {
  return APP_NAV_ITEMS.filter((item) => item.roles.includes(role))
}

export function getRoleDisplayLabel(role: AuthRole): string {
  switch (role) {
    case 'user':
      return 'User'
    case 'merchant':
      return 'Merchant'
    case 'ADMIN':
      return 'Admin'
    case 'SUPER_ADMIN':
      return 'Super Admin'
  }
}

export function getAreaContextLabel(role: AuthRole): string {
  switch (role) {
    case 'user':
      return 'Customer'
    case 'merchant':
      return 'Merchant'
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return 'Administration'
  }
}
