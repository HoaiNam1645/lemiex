'use client'

import { LemiexPageShell } from '@/features/lemiex/components/lemiex-page-shell'

export function LemiexOrders() {
  return (
    <LemiexPageShell
      title='Lemiex Orders'
      description='Vùng chuẩn bị cho module đơn hàng Lemiex.'
      routePath='/lemiex/orders'
    />
  )
}
