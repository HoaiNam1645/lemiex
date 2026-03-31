import * as React from 'react'
import {
  Boxes,
  BrushCleaning,
  CalendarClock,
  ChartColumnBig,
  FileClock,
  LayoutDashboard,
  Package,
  Radar,
  ReceiptText,
  ShieldCheck,
  Store,
  Ticket,
  Users,
  Video,
  Wallet,
  Warehouse,
} from 'lucide-react'
import { type NavCollapsible, type NavGroup, type Team } from '@/components/layout/types'
import { type LemiexRole } from '@/stores/auth-store'

const ALL_ACCESS_ROLES: LemiexRole[] = ['Admin', 'Support']
const STAFF_SCANNER_ROLES: LemiexRole[] = ['QC', 'Packing', 'Shipout']

const ROLE_PERMISSIONS: Record<LemiexRole, string[]> = {
  Admin: ['*'],
  Support: ['*'],
  Seller: [
    '/lemiex/dashboard',
    '/lemiex/orders',
    '/lemiex/orders/*',
    '/lemiex/designs',
    '/lemiex/designs/*',
    '/lemiex/products',
    '/lemiex/products/*',
    '/lemiex/product-variants',
    '/lemiex/product-variants/*',
    '/lemiex/stores',
    '/lemiex/stores/*',
    '/lemiex/tickets',
    '/lemiex/tickets/*',
    '/lemiex/wallets/transactions',
  ],
  Staff: [
    '/lemiex/dashboard',
    '/lemiex/orders',
    '/lemiex/orders/*',
    '/lemiex/stock/dashboard',
    '/lemiex/stock/manage',
    '/lemiex/stock/productions',
    '/lemiex/stock/shortage',
    '/lemiex/stock/shortage-by-variant',
    '/lemiex/stock/audit-logs',
    '/lemiex/attendances',
    '/lemiex/attendances/*',
    '/lemiex/payroll',
    '/lemiex/payroll/*',
    '/lemiex/payroll/tiers',
    '/lemiex/embroidery-progress',
  ],
  QC: ['/lemiex/welcome'],
  Packing: ['/lemiex/welcome'],
  Shipout: ['/lemiex/welcome'],
}

type LemiexNavItem = NavGroup['items'][number]

function LemiexLogo(props: React.ComponentProps<'div'>) {
  const { className, ...rest } = props

  return React.createElement(
    'div',
    { className, ...rest },
    React.createElement(ShieldCheck, {
      className: 'size-4',
    })
  )
}

function createLemiexNavGroups(): NavGroup[] {
  return [
    {
      title: 'Overview',
      items: [
        {
          title: 'Dashboard',
          url: '/lemiex/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Welcome',
          url: '/lemiex/welcome',
          icon: Radar,
        },
      ],
    },
    {
      title: 'Commerce',
      items: [
        {
          title: 'Orders',
          url: '/lemiex/orders',
          icon: ReceiptText,
        },
        {
          title: 'Designs',
          url: '/lemiex/designs',
          icon: BrushCleaning,
        },
        {
          title: 'Products',
          icon: Package,
          items: [
            {
              title: 'Catalog',
              url: '/lemiex/products',
            },
            {
              title: 'Product Variants',
              url: '/lemiex/product-variants',
            },
          ],
        },
        {
          title: 'Stores',
          url: '/lemiex/stores',
          icon: Store,
        },
        {
          title: 'Tickets',
          url: '/lemiex/tickets',
          icon: Ticket,
        },
      ],
    },
    {
      title: 'Operations',
      items: [
        {
          title: 'Stock Management',
          icon: Warehouse,
          items: [
            {
              title: 'Dashboard',
              url: '/lemiex/stock/dashboard',
            },
            {
              title: 'Manage Stock',
              url: '/lemiex/stock/manage',
            },
            {
              title: 'Productions',
              url: '/lemiex/stock/productions',
            },
            {
              title: 'Shortage Report',
              url: '/lemiex/stock/shortage',
            },
            {
              title: 'Shortage by Variant',
              url: '/lemiex/stock/shortage-by-variant',
            },
            {
              title: 'Audit Logs',
              url: '/lemiex/stock/audit-logs',
            },
          ],
        },
        {
          title: 'HR & Payroll',
          icon: CalendarClock,
          items: [
            {
              title: 'Attendances',
              url: '/lemiex/attendances',
            },
            {
              title: 'Payroll Report',
              url: '/lemiex/payroll',
            },
            {
              title: 'Salary Tiers',
              url: '/lemiex/payroll/tiers',
            },
          ],
        },
        {
          title: 'Embroidery Progress',
          url: '/lemiex/embroidery-progress',
          icon: ChartColumnBig,
        },
      ],
    },
    {
      title: 'Support Tools',
      items: [
        {
          title: 'Trackings',
          url: '/lemiex/trackings',
          icon: Radar,
        },
        {
          title: 'Videos',
          url: '/lemiex/videos',
          icon: Video,
        },
        {
          title: 'Wallets',
          icon: Wallet,
          items: [
            {
              title: 'Transactions',
              url: '/lemiex/wallets/transactions',
            },
            {
              title: 'Pending Fund',
              url: '/lemiex/wallets/pending-fund',
            },
            {
              title: 'Refunds',
              url: '/lemiex/wallets/refunds',
            },
            {
              title: 'Surcharge',
              url: '/lemiex/wallets/surcharge',
            },
            {
              title: 'Debits',
              url: '/lemiex/wallets/debits',
            },
          ],
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          title: 'Staff Report',
          url: '/lemiex/staff-report',
          icon: FileClock,
        },
        {
          title: 'Systems',
          icon: ShieldCheck,
          items: [
            {
              title: 'Users',
              url: '/lemiex/systems/users',
            },
            {
              title: 'Permissions',
              url: '/lemiex/systems/permissions',
            },
          ],
        },
        {
          title: 'Tiers',
          url: '/lemiex/tiers',
          icon: Boxes,
        },
      ],
    },
  ]
}

function hasAccess(role: LemiexRole, path: string) {
  if (ALL_ACCESS_ROLES.includes(role)) return true

  return ROLE_PERMISSIONS[role].some((route) => {
    if (route === '*') return true
    if (route === path) return true
    if (route.endsWith('/*')) {
      const baseRoute = route.slice(0, -2)
      return path.startsWith(baseRoute)
    }
    return false
  })
}

function filterNavItem(role: LemiexRole, item: LemiexNavItem): LemiexNavItem | null {
  if ('url' in item && item.url) {
    return hasAccess(role, item.url) ? item : null
  }

  if (!('items' in item) || !item.items) return null

  const children = item.items
    .map((child) => filterNavItem(role, child))
    .filter(Boolean) as NavCollapsible['items']

  if (children.length === 0) return null

  return {
    ...item,
    items: children,
  }
}

export function getLemiexRole(role: LemiexRole | LemiexRole[] | null | undefined): LemiexRole {
  const resolvedRole = Array.isArray(role) ? role[0] : role

  if (!resolvedRole) return 'Admin'
  return resolvedRole
}

export function isScannerRole(role: LemiexRole) {
  return STAFF_SCANNER_ROLES.includes(role)
}

export function getLemiexTeam(): Team {
  return {
    id: 'lemiex',
    name: 'Lemiex Workspace',
    logo: LemiexLogo,
    plan: 'Role-aware sidebar',
    defaultUrl: '/lemiex/dashboard',
  }
}

export function getLemiexNavGroups(role: LemiexRole = 'Admin'): NavGroup[] {
  return createLemiexNavGroups()
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => filterNavItem(role, item))
        .filter(Boolean) as NavGroup['items'],
    }))
    .filter((group) => group.items.length > 0)
}
