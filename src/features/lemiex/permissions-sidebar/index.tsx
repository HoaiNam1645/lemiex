'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, RotateCcw, Save, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { LanguageSwitch } from '@/components/language-switch'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useI18n } from '@/context/i18n-provider'
import {
  type PageAccessTreeNode,
  getLemiexRole,
  getLemiexPageAccessTree,
  getRolePagePermissions as readRolePagePermissions,
  resetRolePagePermissions,
  saveRolePagePermissions,
} from '@/features/lemiex/layout/sidebar-data'
import { cn } from '@/lib/utils'
import { type LemiexRole, useAuthStore } from '@/stores/auth-store'

type RolePermissionsState = ReturnType<typeof readRolePagePermissions>

const MANAGEABLE_ROLES: LemiexRole[] = [
  'Support',
  'Seller',
  'Staff',
  'QC',
  'Packing',
  'Shipout',
]

const FALLBACK_MESSAGES = {
  vi: {
    title: 'Phân quyền trang',
    subtitle: 'Bật hoặc chặn quyền truy cập menu và page theo từng vai trò.',
    adminNotice: 'Admin luôn có toàn quyền và không chỉnh ở đây.',
    reset: 'Khôi phục mặc định',
    save: 'Lưu cấu hình',
    saved: 'Đã lưu cấu hình quyền truy cập trang',
    resetDone: 'Đã khôi phục cấu hình mặc định',
    page: 'Menu / Page',
    admin: 'Admin',
    fullAccess: 'Toàn quyền',
    empty: 'Không có page nào để cấu hình',
  },
  en: {
    title: 'Page access',
    subtitle: 'Allow or block menu and page access by role.',
    adminNotice: 'Admin always has full access and is not configured here.',
    reset: 'Reset defaults',
    save: 'Save access',
    saved: 'Page access configuration saved',
    resetDone: 'Default access configuration restored',
    page: 'Menu / Page',
    admin: 'Admin',
    fullAccess: 'Full access',
    empty: 'No pages available for configuration',
  },
} as const

function togglePatterns(
  current: string[],
  patterns: string[],
  checked: boolean
) {
  if (checked) {
    return Array.from(new Set([...current, ...patterns]))
  }

  return current.filter((route) => !patterns.includes(route))
}

function hasAllPatterns(current: string[], patterns: string[]) {
  return patterns.every((pattern) => current.includes(pattern))
}

function PageAccessRow({
  node,
  depth,
  permissions,
  onToggleRole,
  expanded,
  onToggleExpand,
  adminAccessLabel,
}: {
  node: PageAccessTreeNode
  depth: number
  permissions: RolePermissionsState
  onToggleRole: (role: LemiexRole, patterns: string[], checked: boolean) => void
  expanded: Record<string, boolean>
  onToggleExpand: (nodeId: string) => void
  adminAccessLabel: string
}) {
  const hasChildren = Boolean(node.children?.length)
  const isExpanded = expanded[node.id] ?? true
  const patterns = node.patterns || []

  return (
    <>
      <div
        className='grid min-h-12 items-center border-b border-border/60 bg-background'
        style={{ gridTemplateColumns: 'minmax(320px, 1fr) repeat(7, 112px)' }}
      >
        <div
          className='flex items-center gap-2 px-4 py-3'
          style={{ paddingLeft: `${16 + depth * 18}px` }}
        >
          {hasChildren ? (
            <button
              type='button'
              onClick={() => onToggleExpand(node.id)}
              className='inline-flex size-6 items-center justify-center rounded-[6px] border border-border/70 bg-background text-muted-foreground transition hover:text-foreground'
            >
              <ChevronDown
                className={cn('size-4 transition-transform', !isExpanded && '-rotate-90')}
              />
            </button>
          ) : (
            <span className='inline-flex size-6 items-center justify-center text-muted-foreground'>
              <ShieldCheck className='size-4' />
            </span>
          )}

          <div className='min-w-0'>
            <div className={cn('truncate', hasChildren ? 'font-semibold' : 'text-sm font-medium')}>
              {node.title}
            </div>
            {node.url ? (
              <div className='truncate text-xs text-muted-foreground'>{node.url}</div>
            ) : null}
          </div>
        </div>

        <div className='px-3 py-3 text-center text-xs font-semibold text-emerald-600'>
          {adminAccessLabel}
        </div>

        {MANAGEABLE_ROLES.map((role) => (
          <div key={`${node.id}-${role}`} className='flex items-center justify-center px-3 py-3'>
            {patterns.length > 0 ? (
              <Checkbox
                checked={hasAllPatterns(permissions[role], patterns)}
                onCheckedChange={(checked) => onToggleRole(role, patterns, Boolean(checked))}
              />
            ) : (
              <span className='text-muted-foreground'>-</span>
            )}
          </div>
        ))}
      </div>

      {hasChildren && isExpanded
        ? node.children?.map((child) => (
            <PageAccessRow
              key={child.id}
              node={child}
              depth={depth + 1}
              permissions={permissions}
              onToggleRole={onToggleRole}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              adminAccessLabel={adminAccessLabel}
            />
          ))
        : null}
    </>
  )
}

export function LemiexPermissionsSidebarPage() {
  const router = useRouter()
  const { locale } = useI18n()
  const m = FALLBACK_MESSAGES[locale]
  const user = useAuthStore((state) => state.auth.user)
  const role = getLemiexRole(user?.role)
  const isAdmin = role === 'Admin'
  const pageTree = useMemo(() => getLemiexPageAccessTree(locale), [locale])
  const [permissions, setPermissions] = useState<RolePermissionsState>(() =>
    readRolePagePermissions()
  )
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const next: Record<string, boolean> = {}
    pageTree.forEach((group) => {
      next[group.id] = true
      group.children?.forEach((child) => {
        if (child.children?.length) next[child.id] = true
      })
    })
    return next
  })

  function handleToggleRole(role: LemiexRole, patterns: string[], checked: boolean) {
    setPermissions((prev) => ({
      ...prev,
      [role]: togglePatterns(prev[role], patterns, checked),
    }))
  }

  function handleToggleExpand(nodeId: string) {
    setExpanded((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }))
  }

  function handleSave() {
    if (!isAdmin) {
      router.replace('/lemiex/welcome')
      return
    }

    saveRolePagePermissions(permissions)
    toast.success(m.saved)
  }

  function handleReset() {
    if (!isAdmin) {
      router.replace('/lemiex/welcome')
      return
    }

    resetRolePagePermissions()
    const nextPermissions = readRolePagePermissions()
    setPermissions(nextPermissions)
    toast.success(m.resetDone)
  }

  if (!isAdmin) return null

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center gap-4'>
          <LanguageSwitch />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fluid className='space-y-6 px-4 py-6 @7xl/content:px-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-semibold tracking-tight'>{m.title}</h1>
            <p className='text-sm text-muted-foreground'>{m.subtitle}</p>
            <p className='text-xs text-muted-foreground'>{m.adminNotice}</p>
          </div>

          <div className='flex items-center gap-3'>
            <Button
              variant='outline'
              className='h-10 rounded-[6px]'
              onClick={handleReset}
            >
              <RotateCcw className='mr-2 size-4' />
              {m.reset}
            </Button>
            <Button className='h-10 rounded-[6px]' onClick={handleSave}>
              <Save className='mr-2 size-4' />
              {m.save}
            </Button>
          </div>
        </div>

        {pageTree.length === 0 ? (
          <div className='py-16 text-center text-sm text-muted-foreground'>{m.empty}</div>
        ) : (
          <ScrollArea className='w-full whitespace-nowrap'>
            <div className='min-w-[1120px] overflow-hidden rounded-[10px] border border-border/80 bg-background'>
              <div
                className='grid border-b border-border/80 bg-muted/40'
                style={{ gridTemplateColumns: 'minmax(320px, 1fr) repeat(7, 112px)' }}
              >
                <div className='px-4 py-3 text-sm font-semibold'>{m.page}</div>
                <div className='px-3 py-3 text-center text-sm font-semibold'>{m.admin}</div>
                {MANAGEABLE_ROLES.map((role) => (
                  <div key={`head-${role}`} className='px-3 py-3 text-center text-sm font-semibold'>
                    {role}
                  </div>
                ))}
              </div>

              {pageTree.map((group) => (
                <PageAccessRow
                  key={group.id}
                  node={group}
                  depth={0}
                  permissions={permissions}
                  onToggleRole={handleToggleRole}
                  expanded={expanded}
                  onToggleExpand={handleToggleExpand}
                  adminAccessLabel={m.fullAccess}
                />
              ))}
            </div>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        )}
      </Main>
    </>
  )
}
