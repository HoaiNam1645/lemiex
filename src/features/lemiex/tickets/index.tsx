'use client'

import { LemiexPageShell } from '@/features/lemiex/components/lemiex-page-shell'

export function LemiexTickets() {
  return (
    <LemiexPageShell
      title='Lemiex Tickets'
      description='Vùng chuẩn bị cho support ticket, chat và escalation của Lemiex.'
      routePath='/lemiex/tickets'
    />
  )
}
