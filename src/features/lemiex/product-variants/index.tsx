'use client'

import { LemiexPageShell } from '@/features/lemiex/components/lemiex-page-shell'

export function LemiexProductVariants() {
  return (
    <LemiexPageShell
      title='Lemiex Variants'
      description='Vùng chuẩn bị cho quản lý variant và pricing của Lemiex.'
      routePath='/lemiex/product-variants'
    />
  )
}
