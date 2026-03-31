'use client'

import { LemiexPageShell } from '@/features/lemiex/components/lemiex-page-shell'

export function LemiexDashboard() {
  return (
    <LemiexPageShell
      title='Lemiex Dashboard'
      description='Không gian tổng quan để bắt đầu dựng lại admin Lemiex trên shell mới.'
      routePath='/lemiex/dashboard'
      notes={[
        'Đây sẽ là màn đầu tiên để ghép số liệu tổng quan từ hệ thống cũ.',
        'Sidebar Lemiex đã sẵn sàng để tiếp tục thêm module thực tế.',
        'Có thể ưu tiên move header cards, charts và quick actions ở bước tiếp theo.',
      ]}
    />
  )
}
