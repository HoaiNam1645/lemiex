'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Package,
  ShoppingCart,
  Wallet,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { LanguageSwitch } from '@/components/language-switch'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useI18n } from '@/context/i18n-provider'
import { getLemiexRole } from '@/features/lemiex/layout/sidebar-data'
import { fetchDashboardStatistics, type DashboardData } from '@/services/dashboard/api'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

const fallbackMessages = {
  title: 'Dashboard',
  subtitle: 'Overview of orders, revenue, stock, and recent system activity.',
  loading: 'Loading dashboard...',
  failedLoad: 'Failed to load dashboard statistics',
  timeRangeLabel: 'Time range',
  last7Days: '7D',
  last30Days: '30D',
  last90Days: '90D',
  lastYear: '1Y',
  sellerScope: 'Seller view',
  sellerScopeDescription: 'Statistics are scoped to your own store activity.',
  totalOrders: 'Orders',
  totalRevenue: 'Revenue',
  productsVariants: 'Products',
  totalStock: 'Stock',
  ordersThisPeriod: '{count} orders this period',
  revenueThisPeriod: '{amount} this period',
  variants: '{count} variants · {active} active',
  lowStockWarning: '{count} variants are low on stock',
  totalDeposits: 'Deposits',
  totalWithdrawals: 'Withdrawals',
  totalPayments: 'Payments',
  pendingTransactions: 'Pending',
  transactionsThisPeriod: '{count} transactions this period',
  productSalesQuantity: 'Product sales quantity',
  top5Products: 'Top product performance over time',
  revenueByPaymentStatus: 'Revenue by payment status',
  dailyBreakdown: 'Daily revenue breakdown',
  dailyOrders: 'Daily orders',
  ordersPerDay: 'Orders created per day',
  transactionsOverview: 'Transactions overview',
  dailyTransactions: 'Daily transaction amounts by type',
  noSalesData: 'No product sales data',
  noRevenueData: 'No revenue data',
  noOrderData: 'No daily order data',
  noTransactionData: 'No transaction data',
  ordersByPaymentStatus: 'Orders by payment status',
  ordersByFulfillStatus: 'Orders by fulfill status',
  topProducts: 'Top products',
  recentOrders: 'Recent orders',
  noRecentOrders: 'No recent orders',
  noTopProducts: 'No top products',
  orderId: 'Order ID',
  store: 'Store',
  items: 'Items',
  paymentStatus: 'Payment',
  fulfillStatus: 'Fulfill',
  created: 'Created',
  viewAll: 'View all',
  vsPrevious: 'vs previous period',
  empty: 'No data available',
  units: 'units',
}

const PRODUCT_COLORS = ['#0f766e', '#2563eb', '#f97316', '#e11d48', '#7c3aed']
const TRANSACTION_COLORS: Record<string, string> = {
  deposit: '#059669',
  withdrawal: '#dc2626',
  payment: '#2563eb',
  refund: '#f59e0b',
  other: '#64748b',
}
const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: '#059669',
  pending: '#f59e0b',
  processing: '#2563eb',
  completed: '#10b981',
  cancelled: '#ef4444',
  refunded: '#8b5cf6',
  unpaid: '#dc2626',
}
const FULFILL_STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  in_producn: '#2563eb',
  ready_to_ship: '#7c3aed',
  shipped: '#10b981',
  delivered: '#059669',
}

function formatCurrency(amount: number | null | undefined) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat('en-US').format(value || 0)
}

function formatShortDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getDate()}/${date.getMonth() + 1}`
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getGrowthColor(growth: number) {
  if (growth > 0) return 'text-emerald-600'
  if (growth < 0) return 'text-rose-600'
  return 'text-muted-foreground'
}

function StatusList({
  entries,
  colorMap,
}: {
  entries: Array<[string, number]>
  colorMap: Record<string, string>
}) {
  return (
    <div className='space-y-3'>
      {entries.map(([key, count]) => (
        <div key={key} className='flex items-center justify-between gap-4'>
          <div className='flex min-w-0 items-center gap-3'>
            <span
              className='size-2.5 rounded-full'
              style={{ backgroundColor: colorMap[key] || '#64748b' }}
            />
            <span className='truncate text-sm capitalize'>
              {key.replaceAll('_', ' ')}
            </span>
          </div>
          <span className='text-sm font-semibold'>{formatNumber(count)}</span>
        </div>
      ))}
    </div>
  )
}

type ProductSalesTooltipEntry = {
  dataKey?: string | number
  name?: string
  color?: string
  value?: number | string
}

function ProductSalesTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: ProductSalesTooltipEntry[]
  label?: string
}) {
  if (!active || !payload?.length) return null

  const rows = payload
    .filter((entry: ProductSalesTooltipEntry) => typeof entry.value === 'number' && Number(entry.value) > 0)
    .sort((a: ProductSalesTooltipEntry, b: ProductSalesTooltipEntry) => Number(b.value) - Number(a.value))

  if (rows.length === 0) return null

  return (
    <div className='min-w-[260px] rounded-[12px] border border-border/80 bg-background/95 p-4 shadow-xl backdrop-blur-sm'>
      <div className='mb-3 text-sm font-semibold text-foreground'>{label}</div>
      <div className='space-y-2.5'>
        {rows.map((entry: ProductSalesTooltipEntry) => (
          <div key={String(entry.dataKey)} className='flex items-center justify-between gap-4'>
            <div className='flex min-w-0 items-center gap-2.5'>
              <span
                className='size-2.5 shrink-0 rounded-full'
                style={{ backgroundColor: entry.color || '#64748b' }}
              />
              <span
                className='truncate text-sm font-medium'
                style={{ color: entry.color || '#0f172a' }}
              >
                {entry.name}
              </span>
            </div>
            <span className='text-sm font-semibold text-foreground'>
              {formatNumber(Number(entry.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductSalesLegend({
  items,
}: {
  items: string[]
}) {
  return (
    <div className='flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/70 pt-4'>
      {items.map((name, index) => (
        <div key={name} className='flex items-center gap-2'>
          <span
            className='size-2.5 rounded-full'
            style={{ backgroundColor: PRODUCT_COLORS[index % PRODUCT_COLORS.length] }}
          />
          <span className='text-xs font-medium text-muted-foreground'>{name}</span>
        </div>
      ))}
    </div>
  )
}

function rankProductSeries(
  rows: Array<Record<string, string | number>>,
  keys: string[]
) {
  return [...keys]
    .map((key) => ({
      key,
      total: rows.reduce(
        (sum, row) => sum + (typeof row[key] === 'number' ? Number(row[key]) : 0),
        0
      ),
    }))
    .sort((a, b) => b.total - a.total)
    .map((item) => item.key)
}

function StatCard({
  title,
  value,
  detail,
  growth,
  icon,
  iconTone,
  vsPreviousText,
}: {
  title: string
  value: string
  detail?: string
  growth?: number
  icon: React.ComponentType<{ className?: string }>
  iconTone: string
  vsPreviousText?: string
}) {
  const Icon = icon

  return (
    <Card className='gap-4 rounded-[10px] py-5'>
      <CardContent className='flex items-start justify-between px-5'>
        <div className='space-y-3'>
          <div className='text-sm text-muted-foreground'>{title}</div>
          <div className='text-3xl font-semibold tracking-tight'>{value}</div>
          {typeof growth === 'number' ? (
            <div className={cn('flex items-center gap-1 text-sm', getGrowthColor(growth))}>
              {growth > 0 ? (
                <ArrowUpRight className='size-4' />
              ) : growth < 0 ? (
                <ArrowDownRight className='size-4' />
              ) : (
                <ArrowRight className='size-4' />
              )}
              <span>{Math.abs(growth).toFixed(1)}%</span>
              <span className='text-muted-foreground'>
                {vsPreviousText || fallbackMessages.vsPrevious}
              </span>
            </div>
          ) : null}
          {detail ? <div className='text-sm text-muted-foreground'>{detail}</div> : null}
        </div>

        <div className={cn('rounded-[10px] p-3', iconTone)}>
          <Icon className='size-5' />
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-10 w-48' />
          <Skeleton className='h-4 w-80' />
        </div>
        <Skeleton className='h-10 w-60' />
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className='h-40 rounded-[10px]' />
        ))}
      </div>

      <div className='grid gap-4 xl:grid-cols-2'>
        <Skeleton className='h-[360px] rounded-[10px]' />
        <Skeleton className='h-[360px] rounded-[10px]' />
      </div>
    </div>
  )
}

export function LemiexDashboard() {
  const router = useRouter()
  const { messages } = useI18n()
  const user = useAuthStore((state) => state.auth.user)
  const role = getLemiexRole(user?.role ?? user?.role_name)
  const isStaff = role === 'Staff'
  const isSeller = role === 'Seller'
  const m = messages.dashboardPage ?? fallbackMessages

  const [timeRange, setTimeRange] = useState('30')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardData | null>(null)

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchDashboardStatistics(timeRange)
      setStats(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : m.failedLoad)
    } finally {
      setLoading(false)
    }
  }, [m.failedLoad, timeRange])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  const overview = stats?.overview || {}
  const paymentStatusEntries = Object.entries(stats?.orders_by_payment_status || {})
  const fulfillStatusEntries = Object.entries(stats?.orders_by_fulfill_status || {})
  const recentOrders = stats?.recent_orders || []
  const topProducts = stats?.top_products || []
  const productSalesChart = useMemo(
    () => stats?.product_sales_chart || [],
    [stats?.product_sales_chart]
  )
  const productSeries = useMemo(
    () => stats?.top_product_names || [],
    [stats?.top_product_names]
  )
  const rankedProductSeries = useMemo(
    () => rankProductSeries(productSalesChart, productSeries),
    [productSalesChart, productSeries]
  )
  const displayedProductSeries = useMemo(
    () => rankedProductSeries.slice(0, 4),
    [rankedProductSeries]
  )
  const revenueChart = useMemo(() => stats?.revenue_chart || [], [stats?.revenue_chart])
  const orderCountChart = stats?.order_count_chart || []
  const transactionChart = useMemo(
    () => stats?.transaction_chart || [],
    [stats?.transaction_chart]
  )
  const transactionSummary = stats?.transaction_summary

  const paymentStatuses = useMemo(() => {
    const keys = new Set<string>()
    revenueChart.forEach((point) => {
      Object.entries(point).forEach(([key, value]) => {
        if (key !== 'date' && typeof value === 'number' && value > 0) keys.add(key)
      })
    })
    return Array.from(keys)
  }, [revenueChart])

  const transactionTypes = useMemo(() => {
    const keys = new Set<string>()
    transactionChart.forEach((point) => {
      Object.entries(point).forEach(([key]) => {
        if (key !== 'date') keys.add(key)
      })
    })
    return Array.from(keys)
  }, [transactionChart])

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center gap-4'>
          <LanguageSwitch />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fluid className='space-y-6 px-4 py-6 @7xl/content:px-6'>
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
              <div className='space-y-1'>
                <h1 className='text-3xl font-semibold tracking-tight'>
                  {m.title}
                </h1>
                <p className='text-sm text-muted-foreground'>
                  {m.subtitle}
                </p>
              </div>

              <div className='flex flex-col items-start gap-3 lg:items-end'>
                {isSeller ? (
                  <Badge variant='secondary' className='rounded-[8px] px-3 py-1 text-xs font-medium'>
                    {m.sellerScope}
                  </Badge>
                ) : null}
                <div className='space-y-2'>
                  <div className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                    {m.timeRangeLabel}
                  </div>
                  <Tabs value={timeRange} onValueChange={setTimeRange}>
                    <TabsList>
                      <TabsTrigger value='7'>{m.last7Days}</TabsTrigger>
                      <TabsTrigger value='30'>{m.last30Days}</TabsTrigger>
                      <TabsTrigger value='90'>{m.last90Days}</TabsTrigger>
                      <TabsTrigger value='365'>{m.lastYear}</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                {isSeller ? (
                  <p className='max-w-[280px] text-right text-xs text-muted-foreground'>
                    {m.sellerScopeDescription}
                  </p>
                ) : null}
              </div>
            </div>

            <div className={cn('grid gap-4', isStaff ? 'xl:grid-cols-3' : 'xl:grid-cols-4')}>
              <StatCard
                title={m.totalOrders}
                value={formatNumber(overview.total_orders)}
                detail={m.ordersThisPeriod.replace(
                  '{count}',
                  formatNumber(overview.orders_this_period)
                )}
                growth={overview.orders_growth}
                icon={ShoppingCart}
                iconTone='bg-sky-50 text-sky-700'
                vsPreviousText={m.vsPrevious}
              />

              {!isStaff ? (
                <StatCard
                  title={m.totalRevenue}
                  value={formatCurrency(overview.total_revenue)}
                  detail={m.revenueThisPeriod.replace(
                    '{amount}',
                    formatCurrency(overview.revenue_this_period)
                  )}
                  growth={overview.revenue_growth}
                  icon={DollarSign}
                  iconTone='bg-emerald-50 text-emerald-700'
                  vsPreviousText={m.vsPrevious}
                />
              ) : null}

              <StatCard
                title={m.productsVariants}
                value={formatNumber(overview.total_products)}
                detail={m.variants
                  .replace('{count}', formatNumber(overview.total_variants))
                  .replace('{active}', formatNumber(overview.active_variants))}
                icon={Package}
                iconTone='bg-violet-50 text-violet-700'
              />

              <StatCard
                title={m.totalStock}
                value={formatNumber(overview.total_stock)}
                detail={
                  overview.low_stock_variants
                    ? m.lowStockWarning.replace(
                        '{count}',
                        formatNumber(overview.low_stock_variants)
                      )
                    : undefined
                }
                icon={Activity}
                iconTone='bg-amber-50 text-amber-700'
              />
            </div>

            {!isStaff && transactionSummary ? (
              <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
                <StatCard
                  title={m.totalDeposits}
                  value={formatCurrency(transactionSummary.total_deposits)}
                  detail={m.transactionsThisPeriod.replace(
                    '{count}',
                    formatNumber(transactionSummary.transactions_this_period)
                  )}
                  icon={Wallet}
                  iconTone='bg-emerald-50 text-emerald-700'
                />
                <StatCard
                  title={m.totalWithdrawals}
                  value={formatCurrency(transactionSummary.total_withdrawals)}
                  icon={CreditCard}
                  iconTone='bg-rose-50 text-rose-700'
                />
                <StatCard
                  title={m.totalPayments}
                  value={formatCurrency(transactionSummary.total_payments)}
                  icon={DollarSign}
                  iconTone='bg-sky-50 text-sky-700'
                />
                <StatCard
                  title={m.pendingTransactions}
                  value={formatNumber(transactionSummary.pending_transactions)}
                  icon={Activity}
                  iconTone='bg-amber-50 text-amber-700'
                />
              </div>
            ) : null}

            <div className={cn('grid gap-4', isStaff ? 'xl:grid-cols-1' : 'xl:grid-cols-2')}>
              <Card className='gap-0 rounded-[10px]'>
                <CardHeader>
                  <CardTitle>{m.productSalesQuantity}</CardTitle>
                  <CardDescription>{m.top5Products}</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4 px-4 pb-4'>
                  {productSalesChart.length > 0 ? (
                    <>
                      <div className='h-[340px] rounded-[12px] border border-border/70 bg-background p-2'>
                        <ResponsiveContainer width='100%' height='100%'>
                          <LineChart
                            data={productSalesChart}
                            margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
                          >
                            <CartesianGrid
                              stroke='rgba(148, 163, 184, 0.28)'
                              strokeDasharray='4 4'
                              vertical={false}
                            />
                            <XAxis
                              dataKey='date'
                              tickFormatter={formatShortDate}
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              dy={6}
                              tick={{ fill: '#64748b' }}
                            />
                            <YAxis
                              fontSize={12}
                              allowDecimals={false}
                              tickLine={false}
                              axisLine={false}
                              width={36}
                              tick={{ fill: '#64748b' }}
                            />
                            <Tooltip
                              cursor={{ stroke: 'rgba(59, 130, 246, 0.35)', strokeDasharray: '4 4' }}
                              content={<ProductSalesTooltip />}
                            />
                            {displayedProductSeries.map((name, index) => (
                              <Line
                                key={name}
                                dataKey={name}
                                type='linear'
                                stroke={PRODUCT_COLORS[index % PRODUCT_COLORS.length]}
                                strokeWidth={index === 0 ? 3.5 : 2.25}
                                dot={false}
                                activeDot={{
                                  r: 6,
                                  fill: PRODUCT_COLORS[index % PRODUCT_COLORS.length],
                                  stroke: '#ffffff',
                                  strokeWidth: 3,
                                }}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <ProductSalesLegend items={displayedProductSeries} />
                    </>
                  ) : (
                    <div className='flex h-[340px] items-center justify-center text-sm text-muted-foreground'>
                      {m.noSalesData}
                    </div>
                  )}
                </CardContent>
              </Card>

              {!isStaff ? (
                <Card className='gap-0 rounded-[10px]'>
                  <CardHeader>
                    <CardTitle>{m.revenueByPaymentStatus}</CardTitle>
                    <CardDescription>{m.dailyBreakdown}</CardDescription>
                  </CardHeader>
                  <CardContent className='h-[340px] px-4 pb-4'>
                    {revenueChart.length > 0 && paymentStatuses.length > 0 ? (
                      <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={revenueChart}>
                          <CartesianGrid strokeDasharray='3 3' vertical={false} />
                          <XAxis dataKey='date' tickFormatter={formatShortDate} fontSize={12} />
                          <YAxis
                            fontSize={12}
                            tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`}
                          />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          {paymentStatuses.map((status, index) => (
                            <Bar
                              key={status}
                              dataKey={status}
                              stackId='revenue'
                              fill={
                                PAYMENT_STATUS_COLORS[status] ||
                                PRODUCT_COLORS[index % PRODUCT_COLORS.length]
                              }
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
                        {m.noRevenueData}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <div className={cn('grid gap-4', isStaff ? 'xl:grid-cols-1' : 'xl:grid-cols-2')}>
              <Card className='gap-0 rounded-[10px]'>
                <CardHeader>
                  <CardTitle>{m.dailyOrders}</CardTitle>
                  <CardDescription>{m.ordersPerDay}</CardDescription>
                </CardHeader>
                <CardContent className='h-[320px] px-4 pb-4'>
                  {orderCountChart.length > 0 ? (
                    <ResponsiveContainer width='100%' height='100%'>
                      <LineChart data={orderCountChart} margin={{ top: 8, right: 12, bottom: 12, left: 0 }}>
                        <CartesianGrid strokeDasharray='4 4' vertical={false} />
                        <XAxis dataKey='date' tickFormatter={formatShortDate} fontSize={12} tickLine={false} axisLine={false} dy={6} />
                        <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} width={32} />
                        <Tooltip />
                        <Line
                          type='monotone'
                          dataKey='orders'
                          stroke='#2563eb'
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
                      {m.noOrderData}
                    </div>
                  )}
                </CardContent>
              </Card>

              {!isStaff ? (
                <Card className='gap-0 rounded-[10px]'>
                  <CardHeader>
                    <CardTitle>{m.transactionsOverview}</CardTitle>
                    <CardDescription>{m.dailyTransactions}</CardDescription>
                  </CardHeader>
                  <CardContent className='h-[320px] px-4 pb-4'>
                    {transactionChart.length > 0 && transactionTypes.length > 0 ? (
                      <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={transactionChart}>
                          <CartesianGrid strokeDasharray='3 3' vertical={false} />
                          <XAxis dataKey='date' tickFormatter={formatShortDate} fontSize={12} />
                          <YAxis
                            fontSize={12}
                            tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`}
                          />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          {transactionTypes.map((type) => (
                            <Bar
                              key={type}
                              dataKey={type}
                              stackId='transactions'
                              fill={TRANSACTION_COLORS[type] || TRANSACTION_COLORS.other}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
                        {m.noTransactionData}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <div
              className={cn(
                'grid gap-4',
                isStaff ? 'xl:grid-cols-12' : 'xl:grid-cols-12'
              )}
            >
              {!isStaff ? (
                <Card className='gap-0 rounded-[10px] xl:col-span-4'>
                  <CardHeader>
                    <CardTitle>{m.ordersByPaymentStatus}</CardTitle>
                  </CardHeader>
                  <CardContent className='px-5 pb-5'>
                    {paymentStatusEntries.length > 0 ? (
                      <StatusList
                        entries={paymentStatusEntries}
                        colorMap={PAYMENT_STATUS_COLORS}
                      />
                    ) : (
                      <div className='text-sm text-muted-foreground'>{m.empty}</div>
                    )}
                  </CardContent>
                </Card>
              ) : null}

              <Card className={cn('gap-0 rounded-[10px]', isStaff ? 'xl:col-span-6' : 'xl:col-span-4')}>
                <CardHeader>
                  <CardTitle>{m.ordersByFulfillStatus}</CardTitle>
                </CardHeader>
                <CardContent className='px-5 pb-5'>
                  {fulfillStatusEntries.length > 0 ? (
                    <StatusList
                      entries={fulfillStatusEntries}
                      colorMap={FULFILL_STATUS_COLORS}
                    />
                  ) : (
                    <div className='text-sm text-muted-foreground'>{m.empty}</div>
                  )}
                </CardContent>
              </Card>

              <Card className={cn('gap-0 rounded-[10px]', isStaff ? 'xl:col-span-6' : 'xl:col-span-4')}>
                <CardHeader>
                  <CardTitle>{m.topProducts}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 px-5 pb-5'>
                  {topProducts.length > 0 ? (
                    topProducts.map((product, index) => (
                      <div
                        key={`${product.product_name || 'product'}-${index}`}
                        className='flex items-start gap-3 rounded-[8px] border px-3 py-3'
                      >
                        <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary'>
                          {index + 1}
                        </div>
                        <div className='min-w-0'>
                          <div className='truncate font-medium'>
                            {product.product_name || m.empty}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {formatNumber(product.total_quantity)} {m.units}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-sm text-muted-foreground'>
                      {m.noTopProducts}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className='gap-0 rounded-[10px]'>
              <CardHeader className='flex flex-row items-center justify-between gap-4'>
                <div>
                  <CardTitle>{m.recentOrders}</CardTitle>
                </div>
                <Button
                  variant='ghost'
                  className='h-8 rounded-[6px] px-2'
                  onClick={() => router.push('/lemiex/orders')}
                >
                  {m.viewAll}
                </Button>
              </CardHeader>
              <CardContent className='px-0 pb-2'>
                {recentOrders.length > 0 ? (
                  <div className='overflow-x-auto'>
                    <Table className='min-w-[720px]'>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{m.orderId}</TableHead>
                          <TableHead>{m.store}</TableHead>
                          <TableHead>{m.items}</TableHead>
                          <TableHead>{m.paymentStatus}</TableHead>
                          <TableHead>{m.fulfillStatus}</TableHead>
                          <TableHead>{m.created}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentOrders.map((order) => (
                          <TableRow
                            key={order.id}
                            className='cursor-pointer'
                            onClick={() => router.push(`/lemiex/orders/${order.id}`)}
                          >
                            <TableCell className='font-medium'>
                              {order.ref_id || `#${order.id}`}
                            </TableCell>
                            <TableCell>{order.store_name || m.empty}</TableCell>
                            <TableCell>{formatNumber(order.total_items)}</TableCell>
                            <TableCell>
                              <Badge variant='secondary' className='rounded-[6px] capitalize'>
                                {(order.payment_status || 'n/a').replaceAll('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant='outline' className='rounded-[6px] capitalize'>
                                {(order.fulfill_status || 'n/a').replaceAll('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDateTime(order.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className='px-6 py-8 text-sm text-muted-foreground'>
                    {m.noRecentOrders}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Main>
    </>
  )
}
