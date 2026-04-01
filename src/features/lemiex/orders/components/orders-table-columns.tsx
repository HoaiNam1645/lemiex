'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { useI18n } from '@/context/i18n-provider'
import { Badge } from '@/components/ui/badge'
import { OrderActionsCell } from '@/features/lemiex/orders/components/order-actions-cell'
import { OrderFulfillStatusCell } from '@/features/lemiex/orders/components/order-fulfill-status-cell'
import { OrderItemsCell } from '@/features/lemiex/orders/components/order-items-cell'
import { FALLBACK_FULFILL_STATUS_OPTIONS } from '@/features/lemiex/orders/constants'
import {
  SelectAllOrdersCheckbox,
  SelectOrderCheckbox,
} from '@/features/lemiex/orders/components/orders-selection-context'
import { type LemiexOrderRow } from '@/features/lemiex/orders/types'
import { getUserRoleName } from '@/services/auth/api'
import { type SelectOption } from '@/services/orders/api'
import { type AuthUser } from '@/stores/auth-store'

function formatStatusLabel(
  value: string | null | undefined,
  messages: ReturnType<typeof useI18n>['messages']['orders']
) {
  if (!value) return messages.status.unknown
  const localized =
    messages.fulfillStatuses[
      value as keyof typeof messages.fulfillStatuses
    ] ||
    messages.paymentStatuses[
      value as keyof typeof messages.paymentStatuses
    ]
  if (localized) return localized
  return value.replaceAll('_', ' ')
}

function formatDateTime(
  value: string | null | undefined,
  messages: ReturnType<typeof useI18n>['messages']['orders']
) {
  if (!value) return messages.status.na

  try {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return value
  }
}

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value || 0)
}

function getEmbroideryType(order: LemiexOrderRow) {
  return order.items?.[0]?.designs?.[0]?.embroidery_type || 'standard'
}

function getVariantSummary(
  order: LemiexOrderRow,
  messages: ReturnType<typeof useI18n>['messages']['orders']
) {
  const variants = order.items
    ?.map((item) => item.variant_id)
    .filter((item): item is string => Boolean(item))

  if (!variants || variants.length === 0) return messages.status.noVariant
  return variants.join(', ')
}

export function getOrdersTableColumns(
  user: AuthUser | null,
  messages: ReturnType<typeof useI18n>['messages']['orders'],
  fulfillStatusOptions: SelectOption[],
  onOrderUpdated: () => void
): ColumnDef<LemiexOrderRow>[] {
  const role = getUserRoleName(user)
  const showSellerColumn = role === 'Admin' || role === 'Staff'
  const showTicketColumn = role !== 'Staff'
  const effectiveFulfillStatusOptions =
    fulfillStatusOptions.length > 0
      ? fulfillStatusOptions
      : FALLBACK_FULFILL_STATUS_OPTIONS

  const columns: ColumnDef<LemiexOrderRow>[] = [
    {
      id: 'select',      
      header: () => <SelectAllOrdersCheckbox />,
      meta: { thClassName: 'min-w-[44px]', tdClassName: 'w-[44px]' },
      cell: ({ row }) => <SelectOrderCheckbox orderId={row.original.id} />,
    },
    {
      accessorKey: 'id',
      header: messages.headers.order,
      meta: { thClassName: 'min-w-[240px]' },
      cell: ({ row }) => {
        const order = row.original

        return (
          <div className='space-y-1'>
            <div className='font-semibold'>#{order.id}</div>
            <div className='text-sm text-muted-foreground'>
              {order.ref_id || messages.status.noRefId}
            </div>
            <div className='line-clamp-1 text-xs text-muted-foreground'>
              {getVariantSummary(order, messages)}
            </div>
          </div>
        )
      },
    },
  ]

  if (showSellerColumn) {
    columns.push({
      id: 'seller',
      header: messages.headers.seller,
      meta: { thClassName: 'min-w-[140px]' },
      cell: ({ row }) => {
        const seller = row.original.seller
        return seller?.username || seller?.name || messages.status.na
      },
    })
  }

  if (showTicketColumn) {
    columns.push({
      id: 'ticket',
      header: messages.headers.ticket,
      meta: { thClassName: 'min-w-[96px]' },
      cell: ({ row }) => {
        const ticketId = row.original.support_ticket?.id

        if (ticketId) {
          return <span className='font-medium text-primary'>#{ticketId}</span>
        }

        return row.original.has_ticket ? (
          <Badge className='rounded-[6px]' variant='destructive'>
            {messages.status.hasTicket}
          </Badge>
        ) : (
          <span className='text-muted-foreground'>-</span>
        )
      },
    })
  }

  columns.push(
    {
      accessorKey: 'fulfillment_priority',
      header: messages.headers.priority,
      meta: { thClassName: 'min-w-[110px]' },
      cell: ({ row }) => {
        const isPriority = row.original.fulfillment_priority === 'priority'

        return (
          <Badge
            className='rounded-[6px]'
            variant={isPriority ? 'destructive' : 'secondary'}
          >
            {isPriority ? messages.status.priority : messages.status.normal}
          </Badge>
        )
      },
    },
    {
      id: 'embroidery_type',
      header: messages.headers.embType,
      meta: { thClassName: 'min-w-[120px]' },
      cell: ({ row }) => {
        const embroideryType = getEmbroideryType(row.original)
        return (
          <Badge variant='outline' className='rounded-[6px] capitalize'>
            {embroideryType}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'fulfill_status',
      header: messages.headers.fulfillStatus,
      meta: { thClassName: 'min-w-[160px]' },
      cell: ({ row }) => {
        return (
          <OrderFulfillStatusCell
            order={row.original}
            user={user}
            options={effectiveFulfillStatusOptions}
            onUpdated={onOrderUpdated}
          />
        )
      },
    },
    {
      id: 'items',
      header: messages.headers.items,
      meta: { thClassName: role === 'Seller' ? 'min-w-[100px]' : 'min-w-[360px]' },
      cell: ({ row }) => <OrderItemsCell order={row.original} user={user} />,
    },
    {
      id: 'tracking',
      header: messages.headers.tracking,
      meta: { thClassName: 'min-w-[160px]' },
      cell: ({ row }) => {
        const trackingId = row.original.shipping?.tracking_id

        if (!trackingId) return <span className='text-sm text-muted-foreground'>{messages.status.noTracking}</span>

        return (
          <div className='flex flex-col items-start gap-2'>
            <a
              href={`https://t.17track.net/en#nums=${trackingId}`}
              target='_blank'
              rel='noreferrer'
              className='inline-flex rounded-[6px] bg-muted px-2 py-1 text-[13px] font-medium leading-none text-foreground hover:underline'
            >
              {trackingId}
            </a>

            {row.original.shipping?.label_url || row.original.convert_label ? (
              <div className='flex flex-wrap gap-2'>
                {row.original.shipping?.label_url ? (
                  <a
                    href={row.original.shipping.label_url}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex rounded-[6px] bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700'
                  >
                    {messages.status.label}
                  </a>
                ) : null}

                {row.original.convert_label ? (
                  <a
                    href={row.original.convert_label}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex rounded-[6px] bg-fuchsia-50 px-2 py-1 text-[11px] font-semibold text-fuchsia-700'
                  >
                    {messages.status.convert}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        )
      },
    },
    {
      id: 'print_cost',
      header: messages.headers.printCost,
      meta: { thClassName: 'min-w-[120px]' },
      cell: ({ row }) => (
        <span className='text-sm'>{formatCurrency(row.original.pricing?.print_cost)}</span>
      ),
    },
    {
      id: 'shipping_cost',
      header: messages.headers.shipping,
      meta: { thClassName: 'min-w-[120px]' },
      cell: ({ row }) => (
        <span className='text-sm'>
          {formatCurrency(row.original.pricing?.shipping_cost)}
        </span>
      ),
    },
    {
      id: 'total_cost',
      header: messages.headers.totalCost,
      meta: { thClassName: 'min-w-[130px]' },
      cell: ({ row }) => (
        <span className='text-sm font-medium'>
          {formatCurrency(
            row.original.pricing?.total_cost ?? row.original.total_cost
          )}
        </span>
      ),
    },
    {
      accessorKey: 'payment_status',
      header: messages.headers.payment,
      meta: { thClassName: 'min-w-[120px]' },
      cell: ({ row }) => (
        <Badge variant='outline' className='rounded-[6px] capitalize'>
          {formatStatusLabel(row.original.payment_status, messages)}
        </Badge>
      ),
    },
    {
      accessorKey: 'created_at',
      header: messages.headers.created,
      meta: { thClassName: 'min-w-[180px]' },
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground'>
          {formatDateTime(
            row.original.timestamps?.created_at || row.original.created_at,
            messages
          )}
        </span>
      ),
    },
    {
      id: 'actions',
      header: messages.headers.actions,
      meta: { thClassName: 'min-w-[120px]' },
      cell: ({ row }) => (
        <OrderActionsCell
          order={row.original}
          user={user}
          onOrderUpdated={onOrderUpdated}
        />
      ),
    }
  )

  return columns
}
