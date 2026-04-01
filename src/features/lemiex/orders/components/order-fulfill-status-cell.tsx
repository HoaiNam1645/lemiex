'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/context/i18n-provider'
import {
  changeOrderFulfillStatus,
  sellerCancelOrder,
  type SelectOption,
} from '@/services/orders/api'
import { getUserRoleName } from '@/services/auth/api'
import { type LemiexOrderRow } from '@/features/lemiex/orders/types'
import { type AuthUser } from '@/stores/auth-store'

const statusColors: Record<string, string> = {
  new_order: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200',
  confirm: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200',
  pending_stock:
    'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
  in_stock:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
  producing:
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200',
  qc_pass:
    'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-200',
  packed:
    'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200',
  shipped:
    'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200',
  on_hold:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-200',
  return_to_support:
    'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200',
  cancelled:
    'bg-zinc-200 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-200',
  cancelled_refund_shipping:
    'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
  closed:
    'bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200',
}

function formatStatusLabel(
  value: string | null | undefined,
  fulfillStatuses: Record<string, string>,
  unknownLabel: string
) {
  if (!value) return unknownLabel
  return fulfillStatuses[value] || value.replaceAll('_', ' ')
}

function getSellerFulfillStatusOptions(options: SelectOption[]) {
  return options.filter(
    (option) => option.value === 'on_hold' || option.value === 'cancelled'
  )
}

export function OrderFulfillStatusCell({
  order,
  user,
  options,
  onUpdated,
}: {
  order: LemiexOrderRow
  user: AuthUser | null
  options: SelectOption[]
  onUpdated: () => void
}) {
  const { messages } = useI18n()
  const ordersMessages = messages.orders
  const role = getUserRoleName(user)
  const [pending, setPending] = useState(false)

  const canAdminEdit = role === 'Admin' || role === 'Staff'
  const canSellerEdit =
    role === 'Seller' && order.fulfill_status === 'new_order'
  const canEdit = canAdminEdit || canSellerEdit
  const sellerOptions = getSellerFulfillStatusOptions(options)
  const availableOptions = canSellerEdit
    ? [
        ...(order.fulfill_status &&
        !sellerOptions.some((option) => option.value === order.fulfill_status)
          ? [
              {
                value: order.fulfill_status,
                label: order.fulfill_status,
              },
            ]
          : []),
        ...sellerOptions,
      ]
    : options
  const showSellerCancel =
    role === 'Seller' &&
    order.fulfill_status === 'new_order' &&
    order.payment_status !== 'paid'

  async function handleStatusChange(nextStatus: string) {
    if (!nextStatus || nextStatus === order.fulfill_status) return

    setPending(true)
    try {
      const response = await changeOrderFulfillStatus(order.id, nextStatus)
      toast.success(
        typeof response.message === 'string'
          ? response.message
          : ordersMessages.refresh
      )
      onUpdated()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : ordersMessages.loadErrorTitle
      )
    } finally {
      setPending(false)
    }
  }

  async function handleSellerCancel() {
    const confirmed = window.confirm(
      `Are you sure you want to cancel order #${order.id}?`
    )

    if (!confirmed) return

    setPending(true)
    try {
      const response = await sellerCancelOrder(order.id)
      toast.success(
        typeof response.message === 'string'
          ? response.message
          : ordersMessages.editForm.cancel
      )
      onUpdated()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : ordersMessages.loadErrorTitle
      )
    } finally {
      setPending(false)
    }
  }

  if (!canEdit) {
    return (
      <div className='flex flex-col items-center justify-center gap-2'>
        <Badge
          className={`rounded-[6px] ${statusColors[order.fulfill_status || ''] || 'bg-muted text-foreground'}`}
          variant='secondary'
        >
          {formatStatusLabel(
            order.fulfill_status,
            ordersMessages.fulfillStatuses as Record<string, string>,
            ordersMessages.status.unknown
          )}
        </Badge>

        {showSellerCancel ? (
          <Button
            type='button'
            size='sm'
            variant='destructive'
            className='h-7 rounded-[6px] px-2 text-[11px]'
            onClick={() => void handleSellerCancel()}
            disabled={pending}
          >
            {ordersMessages.editForm.cancel}
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className='flex flex-col items-center justify-center gap-2'
      onClick={(event) => event.stopPropagation()}
    >
      <Select
        value={order.fulfill_status || ''}
        onValueChange={(value) => void handleStatusChange(value)}
        disabled={pending}
      >
        <SelectTrigger className='h-8 min-w-[148px] rounded-[6px] text-[12px]'>
          <SelectValue
            placeholder={formatStatusLabel(
              order.fulfill_status,
              ordersMessages.fulfillStatuses as Record<string, string>,
              ordersMessages.status.unknown
            )}
          />
        </SelectTrigger>
        <SelectContent>
          {availableOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className='text-[12px]'
            >
              {formatStatusLabel(
                option.value,
                ordersMessages.fulfillStatuses as Record<string, string>,
                ordersMessages.status.unknown
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showSellerCancel ? (
        <Button
          type='button'
          size='sm'
          variant='destructive'
          className='h-7 rounded-[6px] px-2 text-[11px]'
          onClick={() => void handleSellerCancel()}
          disabled={pending}
        >
          {ordersMessages.editForm.cancel}
        </Button>
      ) : null}
    </div>
  )
}
