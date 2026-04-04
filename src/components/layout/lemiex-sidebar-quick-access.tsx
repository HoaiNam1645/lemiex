'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, DollarSign, QrCode, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api'
import { useI18n } from '@/context/i18n-provider'
import { apiRequest } from '@/lib/client'
import { fetchCurrentUser, getUserRoleName } from '@/services/auth/api'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type SidebarAddFundResponse = {
  success?: boolean
  status?: boolean
  message?: string
}

function formatWalletBalance(value: unknown) {
  const numericValue = Number(value ?? 0)
  const formattedValue = Math.abs(numericValue).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return `${numericValue < 0 ? '-$' : '$'}${formattedValue}`
}

function generateTransactionId() {
  const timestamp = Date.now()
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `TXN${timestamp}${randomPart}`
}

export function LemiexSidebarQuickAccess() {
  const { messages } = useI18n()
  const authUser = useAuthStore((state) => state.auth.user)
  const setUser = useAuthStore((state) => state.auth.setUser)

  const roleName = getUserRoleName(authUser)
  const canRequestFund = roleName === 'Seller'

  const [orderIdInput, setOrderIdInput] = useState('')
  const [showAddFundDialog, setShowAddFundDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: 'Deposit' as 'Deposit' | 'Withdraw',
    amount: '',
    note: '',
    transactionId: generateTransactionId(),
  })

  const sidebarMessages = messages.sidebar.lemiex.quickAccess
  const addFundMessages = messages.usersPage.addFundModal

  const walletBalance = useMemo(
    () => formatWalletBalance(authUser?.profile && 'wallet_balance' in authUser.profile ? authUser.profile.wallet_balance : 0),
    [authUser?.profile]
  )

  const resetAddFundForm = () => {
    setFormData({
      type: 'Deposit',
      amount: '',
      note: '',
      transactionId: generateTransactionId(),
    })
  }

  const openTrackPage = () => {
    const trimmedOrderId = orderIdInput.trim()
    if (!trimmedOrderId) {
      toast.error(sidebarMessages.orderIdRequired)
      return
    }

    window.open(
      `https://manage.lemiex.us/track/${encodeURIComponent(trimmedOrderId)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleAddFundDialog = (open: boolean) => {
    setShowAddFundDialog(open)
    if (open) {
      resetAddFundForm()
    }
  }

  const handleSubmitAddFund = async () => {
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error(addFundMessages.invalidAmount)
      return
    }

    try {
      setIsSubmitting(true)
      const response = await apiRequest<SidebarAddFundResponse>(
        `${API_BASE_URL}${API_ENDPOINTS.TRANSACTIONS_ADD_FUND}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: formData.type,
            amount: Number(formData.amount),
            note: formData.note,
            transaction_id: formData.transactionId,
          }),
        }
      )

      if (response.success === false || response.status === false) {
        throw new Error(response.message || sidebarMessages.addFundFailed)
      }

      toast.success(sidebarMessages.addFundPending)
      const currentUserResult = await fetchCurrentUser()
      if (currentUserResult.success) {
        setUser(currentUserResult.user)
      }
      setShowAddFundDialog(false)
      resetAddFundForm()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : sidebarMessages.addFundFailed
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className='px-2 pt-1 pb-2 group-data-[collapsible=icon]:hidden'>
        <div className='space-y-2.5 rounded-xl border border-sidebar-border/60 bg-background p-2.5 shadow-xs'>
          <div className='rounded-xl border border-sidebar-border/70 bg-background px-3 py-2.5'>
            <div className='flex items-center gap-2.5'>
              <div className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-sm'>
                <DollarSign className='size-4' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase'>
                  {sidebarMessages.balance}
                </p>
                <p className='pt-1 text-[14px] leading-none font-semibold text-foreground'>
                  {walletBalance}
                </p>
              </div>
              {canRequestFund ? (
                <Button
                  type='button'
                  onClick={() => handleAddFundDialog(true)}
                  className='h-8 rounded-xl bg-foreground px-2.5 text-[12px] font-semibold text-background shadow-sm hover:bg-foreground/90'
                >
                  {sidebarMessages.add}
                </Button>
              ) : null}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Input
              value={orderIdInput}
              onChange={(event) => setOrderIdInput(event.target.value)}
              placeholder={sidebarMessages.orderIdPlaceholder}
              className='h-10 min-w-0 flex-1 rounded-xl border-sidebar-border/70 bg-background text-sm shadow-none'
            />
            <Button
              type='button'
              size='icon'
              onClick={openTrackPage}
              className='size-9 shrink-0 rounded-xl bg-foreground text-background shadow-sm hover:bg-foreground/90'
              title={sidebarMessages.openTrackPage}
            >
              <ArrowUpRight className='size-4' />
            </Button>
            <Button
              type='button'
              size='icon'
              variant='outline'
              onClick={() => toast.info(sidebarMessages.scanUnavailable)}
              className='size-9 shrink-0 rounded-xl border-sidebar-border/70 bg-background text-foreground shadow-none hover:bg-accent'
              title={sidebarMessages.scanQr}
            >
              <QrCode className='size-4' />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showAddFundDialog} onOpenChange={handleAddFundDialog}>
        <DialogContent className='rounded-[10px] sm:max-w-[560px]'>
          <DialogHeader>
            <DialogTitle>{sidebarMessages.addFundTitle}</DialogTitle>
            <DialogDescription>
              {sidebarMessages.addFundDescription}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>{addFundMessages.type}</label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'Deposit' | 'Withdraw') =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className='h-10 rounded-[6px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Deposit'>{addFundMessages.deposit}</SelectItem>
                    <SelectItem value='Withdraw'>{addFundMessages.withdraw}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>{`${addFundMessages.amount} ($)`}</label>
                <Input
                  type='number'
                  min='0.01'
                  step='0.01'
                  value={formData.amount}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, amount: event.target.value }))
                  }
                  placeholder={addFundMessages.enterAmount}
                  className='h-10 rounded-[6px]'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>{sidebarMessages.transactionId}</label>
              <div className='flex items-center gap-2'>
                <Input
                  value={formData.transactionId}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, transactionId: event.target.value }))
                  }
                  className='h-10 rounded-[6px]'
                />
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className='size-10 rounded-[6px]'
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      transactionId: generateTransactionId(),
                    }))
                  }
                  title={sidebarMessages.generateTransactionId}
                >
                  <RefreshCw className='size-4' />
                </Button>
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>{addFundMessages.note}</label>
              <Textarea
                value={formData.note}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, note: event.target.value }))
                }
                placeholder={addFundMessages.notePlaceholder}
                className='min-h-[110px] rounded-[6px]'
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              className='rounded-[6px]'
              onClick={() => setShowAddFundDialog(false)}
            >
              {addFundMessages.cancel}
            </Button>
            <Button
              type='button'
              className='rounded-[6px]'
              onClick={() => void handleSubmitAddFund()}
              disabled={isSubmitting}
            >
              {isSubmitting ? sidebarMessages.processing : sidebarMessages.submit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
