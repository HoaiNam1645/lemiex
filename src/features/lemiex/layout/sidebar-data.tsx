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
import { type AppLocale } from '@/lib/i18n/types'
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
          title: labels.designs,
          url: '/lemiex/designs',
          icon: BrushCleaning,
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
              title: labels.stockDashboard,
              url: '/lemiex/stock/dashboard',
            },
            {
              title: labels.manageStock,
              url: '/lemiex/stock/manage',
            },
            {
              title: labels.productions,
              url: '/lemiex/stock/productions',
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
        {
          title: labels.embroideryProgress,
          url: '/lemiex/embroidery-progress',
          icon: ChartColumnBig,
        },
      ],
    },
    {
      title: labels.supportTools,
      items: [
        {
          title: labels.trackings,
          url: '/lemiex/trackings',
          icon: Radar,
        },
        {
          title: labels.videos,
          url: '/lemiex/videos',
          icon: Video,
        },
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
            {
              title: labels.refunds,
              url: '/lemiex/wallets/refunds',
            },
            {
              title: labels.surcharge,
              url: '/lemiex/wallets/surcharge',
            },
            {
              title: labels.debits,
              url: '/lemiex/wallets/debits',
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
          ],
        },
        {
          title: labels.tiers,
          url: '/lemiex/tiers',
          icon: Boxes,
        },
      ],
    },
  ]
}

function hasAccess(role: LemiexRole, path: string) {
  const resolvedRole = normalizeLemiexRole(role)
  if (!resolvedRole) return false

  if (ALL_ACCESS_ROLES.includes(resolvedRole)) return true

  return ROLE_PERMISSIONS[resolvedRole].some((route) => {
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
  return isScannerRole(role) ? '/lemiex/welcome' : '/lemiex/dashboard'
}

function normalizeLemiexRole(role: string | null | undefined): LemiexRole | null {
  if (!role) return null

  if ((Object.keys(ROLE_PERMISSIONS) as LemiexRole[]).includes(role as LemiexRole)) {
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
