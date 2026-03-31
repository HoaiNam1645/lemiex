'use client'

import { LemiexPageShell } from '@/features/lemiex/components/lemiex-page-shell'

export function LemiexPermissions() {
  return (
    <LemiexPageShell
      title='Lemiex Permissions'
      description='Vùng chuẩn bị cho ma trận quyền và cấu hình truy cập của Lemiex.'
      routePath='/lemiex/permissions'
    />
  )
}
