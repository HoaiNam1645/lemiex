import * as React from 'react'
import {
  CalendarClock,
  FileClock,
  LayoutDashboard,
  Package,
  Radar,
  ReceiptText,
  ShieldCheck,
  Store,
  Ticket,
  Users,
  Wallet,
  Warehouse,
} from 'lucide-react'
import { type NavCollapsible, type NavGroup, type Team } from '@/components/layout/types'
import { type AppLocale } from '@/lib/i18n/types'
import { type LemiexRole } from '@/stores/auth-store'

const STAFF_SCANNER_ROLES: LemiexRole[] = ['QC', 'Packing', 'Shipout']
const PAGE_ACCESS_STORAGE_KEY = 'lemiex_page_permissions_v1'
const PAGE_ACCESS_EVENT = 'lemiex-page-access-updated'

const DEFAULT_ROLE_PERMISSIONS: Record<LemiexRole, string[]> = {
  Admin: ['*'],
  Support: ['/lemiex/welcome'],
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
    '/lemiex/orders',
    '/lemiex/orders/*',
    '/lemiex/stock/manage',
    '/lemiex/stock/shortage',
    '/lemiex/stock/shortage-by-variant',
    '/lemiex/stock/audit-logs',
    '/lemiex/payroll',
    '/lemiex/payroll/*',
    '/lemiex/payroll/tiers',
  ],
  QC: ['/lemiex/welcome'],
  Packing: ['/lemiex/welcome'],
  Shipout: ['/lemiex/welcome'],
}

const PAGE_ROUTE_PATTERNS: Record<string, string[]> = {
  '/lemiex/dashboard': ['/lemiex/dashboard'],
  '/lemiex/welcome': ['/lemiex/welcome'],
  '/lemiex/orders': ['/lemiex/orders', '/lemiex/orders/*'],
  '/lemiex/products': ['/lemiex/products', '/lemiex/products/*'],
  '/lemiex/product-variants': ['/lemiex/product-variants', '/lemiex/product-variants/*'],
  '/lemiex/stores': ['/lemiex/stores', '/lemiex/stores/*'],
  '/lemiex/tickets': ['/lemiex/tickets', '/lemiex/tickets/*'],
  '/lemiex/stock/manage': ['/lemiex/stock/manage'],
  '/lemiex/stock/shortage': ['/lemiex/stock/shortage'],
  '/lemiex/stock/shortage-by-variant': ['/lemiex/stock/shortage-by-variant'],
  '/lemiex/stock/audit-logs': ['/lemiex/stock/audit-logs'],
  '/lemiex/payroll': ['/lemiex/payroll', '/lemiex/payroll/*'],
  '/lemiex/payroll/tiers': ['/lemiex/payroll/tiers'],
  '/lemiex/wallets/transactions': ['/lemiex/wallets/transactions'],
  '/lemiex/systems/users': ['/lemiex/systems/users', '/lemiex/systems/users/*'],
  '/lemiex/systems/permissions': ['/lemiex/systems/permissions'],
  '/lemiex/systems/permissions-sidebar': ['/lemiex/systems/permissions-sidebar'],
  '/lemiex/tiers': ['/lemiex/tiers', '/lemiex/tiers/*'],
}

type StoredRolePermissions = Partial<Record<LemiexRole, string[]>>

type LemiexNavItem = NavGroup['items'][number]
export type PageAccessTreeNode = {
  id: string
  title: string
  url?: string
  patterns?: string[]
  children?: PageAccessTreeNode[]
}

const LEMIEX_SIDEBAR_LABELS = {
  vi: {
    teamName: 'Không gian Lemiex',
    teamPlan: 'Sidebar theo vai trò',
    overview: 'Tổng quan',
    commerce: 'Thương mại',
    operations: 'Vận hành',
    supportTools: 'Công cụ hỗ trợ',
    administration: 'Quản trị',
    dashboard: 'Bảng điều khiển',
    welcome: 'Chào mừng',
    orders: 'Đơn hàng',
    designs: 'Thiết kế',
    products: 'Sản phẩm',
    catalog: 'Danh mục',
    productVariants: 'Biến thể sản phẩm',
    stores: 'Cửa hàng',
    tickets: 'Khiếu nại',
    stockManagement: 'Quản lý kho',
    stockDashboard: 'Tổng quan kho',
    manageStock: 'Quản lý tồn kho',
    productions: 'Sản xuất',
    shortageReport: 'Báo cáo thiếu hàng',
    shortageByVariant: 'Thiếu hàng theo biến thể',
    auditLogs: 'Lịch sử kiểm tra',
    hrPayroll: 'Nhân sự & lương',
    attendances: 'Chấm công',
    payrollReport: 'Báo cáo lương',
    salaryTiers: 'Bậc lương',
    embroideryProgress: 'Tiến độ thêu',
    trackings: 'Theo dõi đơn',
    videos: 'Video',
    wallets: 'Ví',
    transactions: 'Giao dịch',
    pendingFund: 'Tiền chờ duyệt',
    refunds: 'Hoàn tiền',
    surcharge: 'Phụ thu',
    debits: 'Công nợ',
    staffReport: 'Báo cáo nhân sự',
    systems: 'Hệ thống',
    users: 'Người dùng',
    permissions: 'Phân quyền',
    permissionsSidebar: 'Phân quyền trang',
    tiers: 'Tiers',
  },
  en: {
    teamName: 'Lemiex Workspace',
    teamPlan: 'Role-aware sidebar',
    overview: 'Overview',
    commerce: 'Commerce',
    operations: 'Operations',
    supportTools: 'Support Tools',
    administration: 'Administration',
    dashboard: 'Dashboard',
    welcome: 'Welcome',
    orders: 'Orders',
    designs: 'Designs',
    products: 'Products',
    catalog: 'Catalog',
    productVariants: 'Product Variants',
    stores: 'Stores',
    tickets: 'Tickets',
    stockManagement: 'Stock Management',
    stockDashboard: 'Dashboard',
    manageStock: 'Manage Stock',
    productions: 'Productions',
    shortageReport: 'Shortage Report',
    shortageByVariant: 'Shortage by Variant',
    auditLogs: 'Audit Logs',
    hrPayroll: 'HR & Payroll',
    attendances: 'Attendances',
    payrollReport: 'Payroll Report',
    salaryTiers: 'Salary Tiers',
    embroideryProgress: 'Embroidery Progress',
    trackings: 'Trackings',
    videos: 'Videos',
    wallets: 'Wallets',
    transactions: 'Transactions',
    pendingFund: 'Pending Fund',
    refunds: 'Refunds',
    surcharge: 'Surcharge',
    debits: 'Debits',
    staffReport: 'Staff Report',
    systems: 'Systems',
    users: 'Users',
    permissions: 'Permissions',
    permissionsSidebar: 'Page Access',
    tiers: 'Tiers',
  },
} satisfies Record<AppLocale, Record<string, string>>

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

function readStoredRolePermissions(): StoredRolePermissions {
  if (typeof window === 'undefined') return {}

  try {
    const rawValue = window.localStorage.getItem(PAGE_ACCESS_STORAGE_KEY)
    if (!rawValue) return {}
    const parsed = JSON.parse(rawValue) as StoredRolePermissions

    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function getResolvedRolePermissions(): Record<LemiexRole, string[]> {
  const stored = readStoredRolePermissions()

  return (Object.keys(DEFAULT_ROLE_PERMISSIONS) as LemiexRole[]).reduce(
    (acc, role) => {
      acc[role] = Array.isArray(stored[role])
        ? (stored[role] as string[])
        : DEFAULT_ROLE_PERMISSIONS[role]

      return acc
    },
    {} as Record<LemiexRole, string[]>
  )
}

function getRoutePatterns(path: string) {
  if (
    path === '/lemiex/systems/permissions' ||
    path === '/lemiex/systems/permissions-sidebar'
  ) {
    return []
  }

  return PAGE_ROUTE_PATTERNS[path] || [path]
}

export function getRolePagePermissions() {
  return getResolvedRolePermissions()
}

export function saveRolePagePermissions(nextPermissions: StoredRolePermissions) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(PAGE_ACCESS_STORAGE_KEY, JSON.stringify(nextPermissions))
  window.dispatchEvent(new CustomEvent(PAGE_ACCESS_EVENT))
}

export function resetRolePagePermissions() {
  if (typeof window === 'undefined') return

  window.localStorage.removeItem(PAGE_ACCESS_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent(PAGE_ACCESS_EVENT))
}

export function subscribeToPageAccessChanges(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined

  const handleStorage = (event: StorageEvent) => {
    if (event.key === PAGE_ACCESS_STORAGE_KEY) {
      listener()
    }
  }

  window.addEventListener(PAGE_ACCESS_EVENT, listener)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(PAGE_ACCESS_EVENT, listener)
    window.removeEventListener('storage', handleStorage)
  }
}

function createLemiexNavGroups(locale: AppLocale): NavGroup[] {
  const labels = LEMIEX_SIDEBAR_LABELS[locale]

  return [
    {
      title: labels.overview,
      items: [
        {
          title: labels.dashboard,
          url: '/lemiex/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: labels.welcome,
          url: '/lemiex/welcome',
          icon: Radar,
        },
      ],
    },
    {
      title: labels.commerce,
      items: [
        {
          title: labels.orders,
          url: '/lemiex/orders',
          icon: ReceiptText,
        },
        {
          title: labels.products,
          icon: Package,
          items: [
            {
              title: labels.catalog,
              url: '/lemiex/products',
            },
            {
              title: labels.productVariants,
              url: '/lemiex/product-variants',
            },
          ],
        },
        {
          title: labels.stores,
          url: '/lemiex/stores',
          icon: Store,
        },
        {
          title: labels.tickets,
          url: '/lemiex/tickets',
          icon: Ticket,
        },
      ],
    },
    {
      title: labels.operations,
      items: [
        {
          title: labels.stockManagement,
          icon: Warehouse,
          items: [
            {
              title: labels.manageStock,
              url: '/lemiex/stock/manage',
            },
            {
              title: labels.shortageReport,
              url: '/lemiex/stock/shortage',
            },
            {
              title: labels.shortageByVariant,
              url: '/lemiex/stock/shortage-by-variant',
            },
            {
              title: labels.auditLogs,
              url: '/lemiex/stock/audit-logs',
            },
          ],
        },
        {
          title: labels.hrPayroll,
          icon: CalendarClock,
          items: [
            {
              title: labels.attendances,
              url: '/lemiex/attendances',
            },
            {
              title: labels.payrollReport,
              url: '/lemiex/payroll',
            },
            {
              title: labels.salaryTiers,
              url: '/lemiex/payroll/tiers',
            },
          ],
        },
      ],
    },
    {
      title: labels.supportTools,
      items: [
        {
          title: labels.wallets,
          icon: Wallet,
          items: [
            {
              title: labels.transactions,
              url: '/lemiex/wallets/transactions',
            },
            {
              title: labels.pendingFund,
              url: '/lemiex/wallets/pending-fund',
            },
          ],
        },
      ],
    },
    {
      title: labels.administration,
      items: [
        {
          title: labels.staffReport,
          url: '/lemiex/staff-report',
          icon: FileClock,
        },
        {
          title: labels.systems,
          icon: ShieldCheck,
          items: [
            {
              title: labels.users,
              url: '/lemiex/systems/users',
            },
            {
              title: labels.permissions,
              url: '/lemiex/systems/permissions',
            },
            {
              title: labels.permissionsSidebar,
              url: '/lemiex/systems/permissions-sidebar',
            },
          ],
        },
        {
          title: labels.tiers,
          url: '/lemiex/tiers',
          icon: ShieldCheck,
        },
      ],
    },
  ]
}

function hasAccess(role: LemiexRole, path: string) {
  const resolvedRole = normalizeLemiexRole(role)
  if (!resolvedRole) return false

  if (
    path === '/lemiex/systems/permissions' ||
    path.startsWith('/lemiex/systems/permissions/') ||
    path === '/lemiex/permissions' ||
    path === '/lemiex/systems/permissions-sidebar' ||
    path.startsWith('/lemiex/systems/permissions-sidebar/')
  ) {
    return resolvedRole === 'Admin'
  }

  const resolvedPermissions = getResolvedRolePermissions()

  return resolvedPermissions[resolvedRole].some((route) => {
    if (route === '*') return true
    if (route === path) return true
    if (route.endsWith('/*')) {
      const baseRoute = route.slice(0, -2)
      return path.startsWith(baseRoute)
    }
    return false
  })
}

export function canAccessLemiexPath(role: LemiexRole, path: string) {
  return hasAccess(role, path)
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

type LemiexRoleInput =
  | LemiexRole
  | string
  | { name?: string | null; display_name?: string | null }
  | null
  | undefined

export function getLemiexRole(
  role: LemiexRoleInput | LemiexRoleInput[]
): LemiexRole {
  const resolvedRole = Array.isArray(role) ? role[0] : role
  const roleName =
    typeof resolvedRole === 'string'
      ? resolvedRole
      : resolvedRole && typeof resolvedRole === 'object'
        ? resolvedRole.name
        : null
  const normalizedRole = normalizeLemiexRole(roleName)

  if (!normalizedRole) return 'Admin'
  return normalizedRole
}

export function isScannerRole(role: LemiexRole) {
  const resolvedRole = normalizeLemiexRole(role)
  return resolvedRole ? STAFF_SCANNER_ROLES.includes(resolvedRole) : false
}

export function getDefaultLemiexRoute(role: LemiexRole) {
  if (isScannerRole(role)) return '/lemiex/welcome'

  const resolvedRole = normalizeLemiexRole(role) || 'Admin'
  const resolvedPermissions = getResolvedRolePermissions()
  const firstAllowedRoute = resolvedPermissions[resolvedRole].find(
    (route) => route !== '*' && !route.endsWith('/*')
  )

  return firstAllowedRoute || '/lemiex/welcome'
}

function normalizeLemiexRole(role: string | null | undefined): LemiexRole | null {
  if (!role) return null

  if ((Object.keys(DEFAULT_ROLE_PERMISSIONS) as LemiexRole[]).includes(role as LemiexRole)) {
    return role as LemiexRole
  }

  return null
}

export function getLemiexTeam(locale: AppLocale = 'vi'): Team {
  const labels = LEMIEX_SIDEBAR_LABELS[locale]

  return {
    id: 'lemiex',
    name: labels.teamName,
    logo: LemiexLogo,
    plan: labels.teamPlan,
    defaultUrl: '/lemiex/dashboard',
  }
}

export function getLemiexNavGroups(
  locale: AppLocale = 'vi',
  role: LemiexRole = 'Admin'
): NavGroup[] {
  return createLemiexNavGroups(locale)
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => filterNavItem(role, item))
        .filter(Boolean) as NavGroup['items'],
    }))
    .filter((group) => group.items.length > 0)
}

function mapNavItemToPageAccessNode(item: LemiexNavItem): PageAccessTreeNode {
  if ('url' in item && item.url) {
    return {
      id: item.url,
      title: item.title,
      url: item.url,
      patterns: getRoutePatterns(item.url),
    }
  }

  const children = ('items' in item && item.items ? item.items : []).map((child) =>
    mapNavItemToPageAccessNode(child)
  )

  return {
    id: item.title,
    title: item.title,
    children,
  }
}

export function getLemiexPageAccessTree(locale: AppLocale = 'vi'): PageAccessTreeNode[] {
  return createLemiexNavGroups(locale).map((group) => ({
    id: group.title,
    title: group.title,
    children: group.items.map((item) => mapNavItemToPageAccessNode(item)),
  }))
}
