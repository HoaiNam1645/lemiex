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
          <div className='space-y-2 rounded-[8px] border border-border/70 bg-background p-3'>
            <div className='font-semibold'>#{order.id}</div>
            <div className='text-sm text-muted-foreground break-words'>
              {order.ref_id || messages.status.noRefId}
            </div>
            <div className='line-clamp-1 text-xs text-muted-foreground'>
              {getVariantSummary(order, messages)}
            </div>
            <div className='space-y-1.5 rounded-[8px] border border-border/60 bg-muted/20 p-2'>
              <div className='flex flex-wrap items-center gap-1.5'>
                {showSellerColumn ? (
                  <Badge variant='outline' className='rounded-[6px] text-[11px]'>
                    {(order.seller?.username || order.seller?.name || messages.status.na)}
                  </Badge>
                ) : null}

                {showTicketColumn ? (
                  order.support_ticket?.id ? (
                    <Badge variant='outline' className='rounded-[6px] text-[11px]'>
                      #{order.support_ticket.id}
                    </Badge>
                  ) : order.has_ticket ? (
                    <Badge className='rounded-[6px] text-[11px]' variant='destructive'>
                      {messages.status.hasTicket}
                    </Badge>
                  ) : null
                ) : null}
              </div>

              <div className='flex flex-wrap items-center gap-1.5'>
                <Badge
                  className='rounded-[6px] text-[11px]'
                  variant={order.fulfillment_priority === 'priority' ? 'destructive' : 'secondary'}
                >
                  {order.fulfillment_priority === 'priority'
                    ? messages.status.priority
                    : messages.status.normal}
                </Badge>

                <Badge variant='outline' className='rounded-[6px] text-[11px] capitalize'>
                  {getEmbroideryType(order)}
                </Badge>
              </div>
            </div>
          </div>
        )
      },
    },
  ]

  columns.push(
    {
      id: 'status',
      header: messages.headers.fulfillStatus,
      meta: { thClassName: 'min-w-[220px]' },
      cell: ({ row }) => {
        return (
          <div>
            <OrderFulfillStatusCell
              order={row.original}
              user={user}
              options={effectiveFulfillStatusOptions}
              onUpdated={onOrderUpdated}
            />
          </div>
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
      id: 'logistics',
      header: messages.headers.tracking,
      meta: { thClassName: 'min-w-[200px]' },
      cell: ({ row }) => {
        const trackingId = row.original.shipping?.tracking_id

        return (
          <div className='space-y-2 rounded-[8px] border border-border/70 bg-background p-3'>
            {trackingId ? (
              <a
                href={`https://t.17track.net/en#nums=${trackingId}`}
                target='_blank'
                rel='noreferrer'
                className='inline-flex rounded-[6px] bg-muted px-2 py-1 text-[13px] font-medium leading-none text-foreground hover:underline'
              >
                {trackingId}
              </a>
            ) : (
              <div className='text-sm text-muted-foreground'>{messages.status.noTracking}</div>
            )}

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

            <div className='text-xs text-muted-foreground'>
              {formatDateTime(
                row.original.timestamps?.created_at || row.original.created_at,
                messages
              )}
            </div>
          </div>
        )
      },
    },
    {
      id: 'cost',
      header: messages.headers.totalCost,
      meta: { thClassName: 'min-w-[180px]' },
      cell: ({ row }) => (
        <div className='space-y-1.5 rounded-[8px] border border-border/70 bg-background p-3 text-sm'>
          <Badge variant='outline' className='w-fit rounded-[6px] capitalize'>
            {formatStatusLabel(row.original.payment_status, messages)}
          </Badge>
          <div className='text-xs text-emerald-700'>
            {messages.headers.printCost}: {formatCurrency(row.original.pricing?.print_cost)}
          </div>
          <div className='text-xs text-emerald-700'>
            {messages.headers.shipping}: {formatCurrency(row.original.pricing?.shipping_cost)}
          </div>
          <div className='border-t border-border/60 pt-1 font-semibold text-rose-600'>
            {formatCurrency(
              row.original.pricing?.total_cost ?? row.original.total_cost
            )}
          </div>
        </div>
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
