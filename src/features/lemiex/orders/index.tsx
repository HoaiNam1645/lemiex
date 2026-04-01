'use client'

import { type ComponentType, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CupSoda, Plus, Shirt, Tags, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { DataTableBulkActions } from '@/components/data-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useI18n } from '@/context/i18n-provider'
import { LanguageSwitch } from '@/components/language-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { LemiexDataTable } from '@/features/lemiex/components/lemiex-data-table'
import {
  DEFAULT_ORDERS_FILTERS,
  ORDER_TABS,
} from '@/features/lemiex/orders/constants'
import { OrdersFilters } from '@/features/lemiex/orders/components/orders-filters'
import { OrdersSelectionProvider } from '@/features/lemiex/orders/components/orders-selection-context'
import { getOrdersTableColumns } from '@/features/lemiex/orders/components/orders-table-columns'
import {
  type LemiexOrdersFilters,
  type LemiexOrdersPageState,
  type LemiexOrdersTab,
} from '@/features/lemiex/orders/types'
import {
  buyLabelBatch,
  buyLabelSingle,
  fetchOrderIds,
  fetchOrderFulfillStatusOptions,
  fetchOrders,
  type SelectOption,
  type OrderListResult,
} from '@/services/orders/api'
import { fetchCurrentUser, getUserRoleName } from '@/services/auth/api'
import { useAuthStore } from '@/stores/auth-store'

function parseArrayParam(value: string | null) {
  if (!value) return []
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseSearchParams(searchParams: URLSearchParams): LemiexOrdersPageState {
  return {
    tab: (searchParams.get('tab') || 'embroidery') as LemiexOrdersTab,
    page: Number(searchParams.get('page') || 1),
    perPage: Number(searchParams.get('per_page') || 20),
    filters: {
      order_id: searchParams.get('order_id') || '',
      ref_id: searchParams.get('ref_id') || '',
      tracking_number: searchParams.get('tracking_number') || '',
      product_name: searchParams.get('product_name') || '',
      variant_id: searchParams.get('variant_id') || '',
      style: searchParams.get('style') || '',
      color: searchParams.get('color') || '',
      size: searchParams.get('size') || '',
      seller_id: searchParams.get('seller_id') || '',
      embroidery_type: searchParams.get('embroidery_type') || '',
      fulfill_status: parseArrayParam(searchParams.get('fulfill_status')),
      payment_status: parseArrayParam(searchParams.get('payment_status')),
      exclude_status: parseArrayParam(searchParams.get('exclude_status')),
      date_from: searchParams.get('date_from') || '',
      date_to: searchParams.get('date_to') || '',
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order:
        (searchParams.get('sort_order') as 'asc' | 'desc' | null) || 'asc',
      missing_shipping_info:
        searchParams.get('missing_shipping_info') === 'true',
    },
  }
}

function buildSearchParams(state: LemiexOrdersPageState) {
  const params = new URLSearchParams()

  if (state.tab !== 'embroidery') params.set('tab', state.tab)
  if (state.page > 1) params.set('page', String(state.page))
  if (state.perPage !== 20) params.set('per_page', String(state.perPage))

  Object.entries(state.filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.join(','))
      return
    }

    if (typeof value === 'boolean') {
      if (value) params.set(key, 'true')
      return
    }

    if (value) params.set(key, value)
  })

  return params
}

function hasActiveFilter(filters: LemiexOrdersFilters) {
  return Object.entries(filters).some(([key, value]) => {
    if (key === 'sort_by' || key === 'sort_order' || key === 'exclude_status') {
      return false
    }

    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'boolean') return value

    return value !== ''
  })
}

function buildOrdersRequest(state: LemiexOrdersPageState) {
  const params: Record<string, string | number | boolean | string[]> = {
    page: state.page,
    per_page: state.perPage,
    category: state.tab,
    ...state.filters,
  }

  const defaultExclusions = [
    'cancelled',
    'shipped',
    'test_order',
    'cancelled_refund_shipping',
    'closed',
  ]

  const excludeStatus = [...state.filters.exclude_status]

  if (!hasActiveFilter(state.filters)) {
    excludeStatus.unshift(...defaultExclusions)
  }

  const uniqueExcludeStatus = Array.from(new Set(excludeStatus))
  if (uniqueExcludeStatus.length > 0) {
    params.exclude_status = uniqueExcludeStatus
  }

  return params
}

type CreateOrderCategory = 'embroidery' | 'tumbler'

type CreateOrderType = {
  id: string
  titleKey:
    | 'noDesignTitle'
    | 'labelShipTitle'
    | 'sellerShipTitle'
    | 'tumblerLabelShipTitle'
    | 'tumblerSellerShipTitle'
  descriptionKey:
    | 'noDesignDesc'
    | 'labelShipDesc'
    | 'sellerShipDesc'
    | 'tumblerLabelShipDesc'
    | 'tumblerSellerShipDesc'
  icon: ComponentType<{ className?: string }>
}

const EMBROIDERY_ORDER_TYPES: CreateOrderType[] = [
  {
    id: 'no_design',
    titleKey: 'noDesignTitle',
    descriptionKey: 'noDesignDesc',
    icon: Shirt,
  },
  {
    id: 'label_ship',
    titleKey: 'labelShipTitle',
    descriptionKey: 'labelShipDesc',
    icon: Tags,
  },
  {
    id: 'seller_ship',
    titleKey: 'sellerShipTitle',
    descriptionKey: 'sellerShipDesc',
    icon: Truck,
  },
]

const TUMBLER_ORDER_TYPES: CreateOrderType[] = [
  {
    id: 'tumbler_label_ship',
    titleKey: 'tumblerLabelShipTitle',
    descriptionKey: 'tumblerLabelShipDesc',
    icon: Tags,
  },
  {
    id: 'tumbler_seller_ship',
    titleKey: 'tumblerSellerShipTitle',
    descriptionKey: 'tumblerSellerShipDesc',
    icon: Truck,
  },
]

function getCreateOrderPath(type: string) {
  switch (type) {
    case 'no_design':
      return '/lemiex/orders/create/no-design'
    case 'label_ship':
      return '/lemiex/orders/create/label-ship'
    case 'seller_ship':
      return '/lemiex/orders/create/seller-ship'
    case 'tumbler_label_ship':
      return '/lemiex/orders/create/tumbler-label-ship'
    case 'tumbler_seller_ship':
      return '/lemiex/orders/create/tumbler-seller-ship'
    default:
      return '/lemiex/orders'
  }
}

export function LemiexOrders() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentUser = useAuthStore((state) => state.auth.user)
  const setUser = useAuthStore((state) => state.auth.setUser)
  const { messages } = useI18n()
  const ordersMessages = messages.orders
  const createOrderMessages = ordersMessages.createOrderDialog

  const queryKey = searchParams.toString()
  const state = useMemo(
    () => parseSearchParams(new URLSearchParams(queryKey)),
    [queryKey]
  )

  const [result, setResult] = useState<OrderListResult>({
    orders: [],
    pagination: {
      currentPage: state.page,
      lastPage: 1,
      perPage: state.perPage,
      total: 0,
    },
    summary: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [fulfillStatusOptions, setFulfillStatusOptions] = useState<SelectOption[]>([])
  const [selectedOrderIds, setSelectedOrderIds] = useState<Array<number | string>>([])
  const [buyingLabel, setBuyingLabel] = useState(false)
  const [buyLabelConfirmOpen, setBuyLabelConfirmOpen] = useState(false)
  const [storeRequiredOpen, setStoreRequiredOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [typeDialogOpen, setTypeDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] =
    useState<CreateOrderCategory>('embroidery')

  const selectedOrders = useMemo(
    () =>
      result.orders.filter((order) => selectedOrderIds.includes(String(order.id))),
    [result.orders, selectedOrderIds]
  )
  const role = getUserRoleName(currentUser)
  const canCreateOrder =
    role === 'Seller' || role === 'Admin' || role === 'Support'
  const orderTypes =
    selectedCategory === 'tumbler'
      ? TUMBLER_ORDER_TYPES
      : EMBROIDERY_ORDER_TYPES

  const columns = useMemo(
    () =>
      getOrdersTableColumns(
        currentUser,
        ordersMessages,
        fulfillStatusOptions,
        () => setRefreshKey((value) => value + 1)
      ),
    [currentUser, ordersMessages, fulfillStatusOptions]
  )
  const currentOrderIds = useMemo(
    () => result.orders.map((order) => String(order.id)),
    [result.orders]
  )

  const pushState = (nextState: LemiexOrdersPageState) => {
    const nextParams = buildSearchParams(nextState)
    const nextQuery = nextParams.toString()
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    })
  }

  useEffect(() => {
    let cancelled = false

    async function loadOrders() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetchOrders(buildOrdersRequest(state))
        if (cancelled) return
        setResult(response)
      } catch (loadError) {
        if (cancelled) return
        setError(
          loadError instanceof Error
            ? loadError.message
            : ordersMessages.loadErrorTitle
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      cancelled = true
    }
  }, [state, refreshKey, ordersMessages.loadErrorTitle])

  useEffect(() => {
    let cancelled = false

    fetchOrderFulfillStatusOptions(state.tab)
      .then((options) => {
        if (!cancelled) {
          setFulfillStatusOptions(options.filter(Boolean) as SelectOption[])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFulfillStatusOptions([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [state.tab])

  useEffect(() => {
    const currentIds = new Set(result.orders.map((order) => String(order.id)))
    setSelectedOrderIds((prev) => prev.filter((id) => currentIds.has(String(id))))
  }, [result.orders])

  const handleTabChange = (tab: string) => {
    pushState({
      ...state,
      tab: tab as LemiexOrdersTab,
      page: 1,
    })
  }

  const handleApplyFilters = (filters: LemiexOrdersFilters) => {
    pushState({
      ...state,
      page: 1,
      filters,
    })
  }

  const handleResetFilters = () => {
    pushState({
      ...state,
      page: 1,
      filters: DEFAULT_ORDERS_FILTERS,
    })
  }

  const handleGetIds = async (filters: LemiexOrdersFilters) => {
    try {
      const ids = await fetchOrderIds(
        buildOrdersRequest({
          ...state,
          page: 1,
          filters,
        })
      )

      if (ids.length === 0) {
        toast.info(ordersMessages.noOrderIds)
        return
      }

      await navigator.clipboard.writeText(ids.join('\n'))
      toast.success(ordersMessages.copiedOrderIds.replace('{count}', String(ids.length)))
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Không thể lấy danh sách IDs'
      )
    }
  }

  const handleToggleOrder = (orderId: number | string) => {
    const normalizedOrderId = String(orderId)
    setSelectedOrderIds((prev) =>
      prev.includes(normalizedOrderId)
        ? prev.filter((id) => id !== normalizedOrderId)
        : [...prev, normalizedOrderId]
    )
  }

  const handleToggleAllOrders = (checked: boolean) => {
    setSelectedOrderIds((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, ...currentOrderIds]))
      }

      return prev.filter((id) => !currentOrderIds.includes(String(id)))
    })
  }

  const handleCopyTracking = async () => {
    const trackingNumbers = selectedOrders
      .map((order) => order.shipping?.tracking_id?.trim())
      .filter((tracking): tracking is string => Boolean(tracking))

    if (trackingNumbers.length === 0) {
      toast.warning(ordersMessages.noTrackingNumbers)
      return
    }

    try {
      await navigator.clipboard.writeText(trackingNumbers.join('\n'))
      toast.success(
        ordersMessages.copiedTrackingNumbers.replace(
          '{count}',
          String(trackingNumbers.length)
        )
      )
    } catch {
      toast.error(ordersMessages.copyTrackingFailed)
    }
  }

  const handleBuyLabel = async () => {
    if (selectedOrderIds.length === 0) {
      toast.error(ordersMessages.selectAtLeastOneOrder)
      return
    }

    setBuyingLabel(true)

    try {
      const response =
        selectedOrderIds.length === 1
          ? await buyLabelSingle(selectedOrderIds[0])
          : await buyLabelBatch(selectedOrderIds)

      if (selectedOrderIds.length === 1) {
        toast.success(
          ordersMessages.labelCreated.replace(
            '{tracking}',
            response.data?.tracking_number || ordersMessages.status.na
          )
        )
      } else {
        toast.success(
          ordersMessages.labelJobsDispatched.replace(
            '{count}',
            String(response.data?.dispatched || selectedOrderIds.length)
          )
        )
      }

      setBuyLabelConfirmOpen(false)
      setSelectedOrderIds([])
      setRefreshKey((value) => value + 1)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : ordersMessages.buyLabelFailed
      )
    } finally {
      setBuyingLabel(false)
    }
  }

  const handleCreateOrderClick = async () => {
    const result = await fetchCurrentUser()
    const latestUser = result.success ? result.user : currentUser

    if (result.success) {
      setUser(result.user)
    }

    const stores = Array.isArray(
      (latestUser as { stores?: unknown[] } | null)?.stores
    )
      ? (((latestUser as { stores?: unknown[] } | null)?.stores as unknown[]) ?? [])
      : []

    if (stores.length === 0) {
      setStoreRequiredOpen(true)
      return
    }

    setSelectedCategory('embroidery')
    setCategoryDialogOpen(true)
  }

  const handleSelectCategory = (category: CreateOrderCategory) => {
    setSelectedCategory(category)
    setCategoryDialogOpen(false)
    setTypeDialogOpen(true)
  }

  const handleCreateOrderType = (type: string) => {
    setTypeDialogOpen(false)
    router.push(getCreateOrderPath(type))
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <LanguageSwitch />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fluid className='flex flex-1 flex-col gap-4 px-4 sm:px-5 lg:px-6 xl:px-7'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>{ordersMessages.title}</h2>
            <p className='mt-1 text-lg text-muted-foreground'>
              {result.pagination.total.toLocaleString('en-US')} {ordersMessages.count}
            </p>
          </div>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-3'>
          <Tabs value={state.tab} onValueChange={handleTabChange}>
            <TabsList className='grid w-full max-w-[220px] grid-cols-2'>
              {ORDER_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {ordersMessages[tab.label as 'embroidery' | 'print']}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {canCreateOrder ? (
            <Button
              type='button'
              className='rounded-[6px]'
              onClick={() => void handleCreateOrderClick()}
            >
              <Plus className='size-4' />
              {ordersMessages.createOrder}
            </Button>
          ) : null}
        </div>

        <div className='max-w-[1520px]'>
        <OrdersFilters
          tab={state.tab}
          filters={state.filters}
          user={currentUser}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          onGetIds={handleGetIds}
          />
        </div>

        {error ? (
          <Alert variant='destructive'>
            <AlertTitle>{ordersMessages.loadErrorTitle}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <OrdersSelectionProvider
          value={{
            selectedOrderIds,
            currentOrderIds,
            onToggleOrder: handleToggleOrder,
            onToggleAllOrders: handleToggleAllOrders,
          }}
        >
          <DataTableBulkActions
            selectedCount={selectedOrderIds.length}
            entityName='order'
            onClearSelection={() => setSelectedOrderIds([])}
          >
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='h-8 rounded-[6px] text-[12px]'
              onClick={() => {
                void handleCopyTracking()
              }}
              >
              {ordersMessages.copyTracking}
            </Button>

            <Button
              type='button'
              size='sm'
              className='h-8 rounded-[6px] text-[12px]'
              onClick={() => setBuyLabelConfirmOpen(true)}
            >
              {ordersMessages.buyLabel}
            </Button>
          </DataTableBulkActions>

          <LemiexDataTable
            columns={columns}
            data={result.orders}
            page={result.pagination.currentPage}
            pageSize={result.pagination.perPage}
            total={result.pagination.total}
            loading={loading}
            emptyText={ordersMessages.empty}
            getRowId={(row) => String(row.id)}
            onPageChange={(page) =>
              pushState({
                ...state,
                page,
              })
            }
            onPageSizeChange={(pageSize) =>
              pushState({
                ...state,
                page: 1,
                perPage: pageSize,
              })
            }
          />
        </OrdersSelectionProvider>
      </Main>

      <AlertDialog open={buyLabelConfirmOpen} onOpenChange={setBuyLabelConfirmOpen}>
        <AlertDialogContent className='rounded-[6px]'>
          <AlertDialogHeader>
            <AlertDialogTitle>{ordersMessages.confirmBuyLabel}</AlertDialogTitle>
            <AlertDialogDescription>
              {ordersMessages.confirmBuyLabelDesc.replace(
                '{count}',
                String(selectedOrderIds.length)
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='rounded-[6px]'>
              {messages.profile.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              className='rounded-[6px]'
              onClick={(event) => {
                event.preventDefault()
                void handleBuyLabel()
              }}
              disabled={buyingLabel}
            >
              {buyingLabel ? ordersMessages.processing : ordersMessages.confirmPurchase}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={storeRequiredOpen} onOpenChange={setStoreRequiredOpen}>
        <AlertDialogContent className='rounded-[6px]'>
          <AlertDialogHeader>
            <AlertDialogTitle>{createOrderMessages.storeRequiredTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {createOrderMessages.storeRequiredDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='rounded-[6px]'>
              {messages.profile.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              className='rounded-[6px]'
              onClick={() => router.push('/lemiex/stores')}
            >
              {ordersMessages.actions.goToStores}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className='rounded-[6px] sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>{createOrderMessages.categoryTitle}</DialogTitle>
            <DialogDescription>
              {createOrderMessages.categoryDesc}
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 md:grid-cols-2'>
            <button
              type='button'
              className='rounded-[6px] border p-5 text-left transition-colors hover:bg-muted'
              onClick={() => handleSelectCategory('embroidery')}
            >
              <div className='mb-3 inline-flex rounded-[6px] bg-primary/10 p-2 text-primary'>
                <Shirt className='size-5' />
              </div>
              <div className='text-base font-semibold'>{createOrderMessages.embroideryTitle}</div>
              <div className='mt-1 text-sm text-muted-foreground'>
                {createOrderMessages.embroideryDesc}
              </div>
            </button>

            <button
              type='button'
              className='rounded-[6px] border p-5 text-left transition-colors hover:bg-muted'
              onClick={() => handleSelectCategory('tumbler')}
            >
              <div className='mb-3 inline-flex rounded-[6px] bg-primary/10 p-2 text-primary'>
                <CupSoda className='size-5' />
              </div>
              <div className='text-base font-semibold'>{createOrderMessages.tumblerTitle}</div>
              <div className='mt-1 text-sm text-muted-foreground'>
                {createOrderMessages.tumblerDesc}
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
        <DialogContent className='rounded-[6px] sm:max-w-4xl'>
          <DialogHeader>
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-8 rounded-[6px]'
                onClick={() => {
                  setTypeDialogOpen(false)
                  setCategoryDialogOpen(true)
                }}
              >
                <ArrowLeft className='size-4' />
              </Button>
              <div>
                <DialogTitle>{createOrderMessages.typeTitle}</DialogTitle>
                <DialogDescription>
                  {selectedCategory === 'tumbler'
                    ? createOrderMessages.typeDescTumbler
                    : createOrderMessages.typeDescEmbroidery}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {orderTypes.map((type) => {
              const Icon = type.icon

              return (
                <button
                  key={type.id}
                  type='button'
                  className='rounded-[6px] border p-5 text-left transition-colors hover:bg-muted'
                  onClick={() => handleCreateOrderType(type.id)}
                >
                  <div className='mb-3 inline-flex rounded-[6px] bg-primary/10 p-2 text-primary'>
                    <Icon className='size-5' />
                  </div>
                  <div className='text-base font-semibold'>
                    {createOrderMessages[type.titleKey]}
                  </div>
                  <div className='mt-1 text-sm text-muted-foreground'>
                    {createOrderMessages[type.descriptionKey]}
                  </div>
                </button>
              )
            })}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              className='rounded-[6px]'
              onClick={() => setTypeDialogOpen(false)}
            >
              {messages.profile.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
