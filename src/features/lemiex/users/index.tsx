'use client'

import { LemiexPageShell } from '@/features/lemiex/components/lemiex-page-shell'

export function LemiexUsers() {
  return (
    <LemiexPageShell
      title='Lemiex Users'
      description='Vùng chuẩn bị cho user management và vai trò trong hệ thống Lemiex.'
      routePath='/lemiex/users'
    />
  )
}
