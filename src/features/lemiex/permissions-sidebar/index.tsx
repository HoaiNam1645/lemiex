'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Loader2, RotateCcw, Save, ShieldCheck } from 'lucide-react'
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
  PAGE_ACCESS_GROUP_NAME,
  PAGE_ACCESS_PERMISSION_BY_PATH,
  type PageAccessTreeNode,
  getLemiexPageAccessTree,
  getLemiexRole,
  getRolePagePermissions as getDefaultRolePagePermissions,
} from '@/features/lemiex/layout/sidebar-data'
import { cn } from '@/lib/utils'
import {
  type PermissionRecord,
  createPermission,
  fetchPermissionMatrix,
  updateRolePermissions,
} from '@/services/permissions/api'
import { type LemiexRole, useAuthStore } from '@/stores/auth-store'

type RolePermissionNamesState = Record<LemiexRole, string[]>
type RoleIdsState = Partial<Record<LemiexRole, number>>

const MANAGEABLE_ROLES: LemiexRole[] = [
  'Support',
  'Seller',
  'Staff',
  'QC',
  'Packing',
  'Shipout',
]

const EMPTY_ROLE_PERMISSION_NAMES: RolePermissionNamesState = {
  Admin: [],
  Support: [],
  Seller: [],
  Staff: [],
  QC: [],
  Packing: [],
  Shipout: [],
}

const FALLBACK_MESSAGES = {
  vi: {
    title: 'Phân quyền trang',
    subtitle: 'Tích hoặc bỏ tích từng page để áp quyền truy cập theo vai trò.',
    adminNotice: 'Chỉ Admin mới thấy và chỉnh được màn này. Vai trò khác sẽ nhận cấu hình đã lưu.',
    reset: 'Khôi phục mặc định',
    save: 'Lưu cấu hình',
    saving: 'Đang lưu...',
    loading: 'Đang tải cấu hình phân quyền trang...',
    saved: 'Đã lưu cấu hình quyền truy cập trang',
    resetDone: 'Đã khôi phục cấu hình mặc định',
    page: 'Menu / Page',
    admin: 'Admin',
    fullAccess: 'Toàn quyền',
    empty: 'Không có page nào để cấu hình',
    initError: 'Không thể khởi tạo quyền truy cập trang',
  },
  en: {
    title: 'Page access',
    subtitle: 'Tick or untick each page to manage access by role.',
    adminNotice: 'Only Admin can access and edit this screen. Other roles will receive the saved setup.',
    reset: 'Reset defaults',
    save: 'Save access',
    saving: 'Saving...',
    loading: 'Loading page access configuration...',
    saved: 'Page access configuration saved',
    resetDone: 'Default access configuration restored',
    page: 'Menu / Page',
    admin: 'Admin',
    fullAccess: 'Full access',
    empty: 'No pages available for configuration',
    initError: 'Failed to initialize page access permissions',
  },
} as const

function flattenTree(nodes: PageAccessTreeNode[]) {
  const map = new Map<string, PageAccessTreeNode>()

  function walk(node: PageAccessTreeNode) {
    map.set(node.id, node)
    node.children?.forEach(walk)
  }

  nodes.forEach(walk)
  return map
}

function getPageAccessPermissionName(url?: string) {
  if (!url) return null
  return PAGE_ACCESS_PERMISSION_BY_PATH[url] || null
}

function collectNodePermissionNames(node: PageAccessTreeNode): string[] {
  const selfPermission = getPageAccessPermissionName(node.url)
  const childPermissions = (node.children || []).flatMap((child) =>
    collectNodePermissionNames(child)
  )

  return Array.from(new Set([...(selfPermission ? [selfPermission] : []), ...childPermissions]))
}

function hasAllPermissions(current: string[], permissionNames: string[]) {
  return permissionNames.every((permissionName) => current.includes(permissionName))
}

function togglePermissionNames(current: string[], permissionNames: string[], checked: boolean) {
  if (checked) {
    return Array.from(new Set([...current, ...permissionNames]))
  }

  return current.filter((permissionName) => !permissionNames.includes(permissionName))
}

function buildPagePermissionDefinition(path: string, title: string) {
  const permissionName = PAGE_ACCESS_PERMISSION_BY_PATH[path]

  return {
    name: permissionName,
    display_name: title,
    description: `Page access for ${title}`,
    group: PAGE_ACCESS_GROUP_NAME,
    route: path,
    method: 'GET',
  }
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
  permissions: RolePermissionNamesState
  onToggleRole: (role: LemiexRole, permissionNames: string[], checked: boolean) => void
  expanded: Record<string, boolean>
  onToggleExpand: (nodeId: string) => void
  adminAccessLabel: string
}) {
  const hasChildren = Boolean(node.children?.length)
  const isExpanded = expanded[node.id] ?? true
  const permissionNames = collectNodePermissionNames(node)

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
            {permissionNames.length > 0 ? (
              <Checkbox
                checked={hasAllPermissions(permissions[role], permissionNames)}
                onCheckedChange={(checked) => onToggleRole(role, permissionNames, Boolean(checked))}
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
  const treeMap = useMemo(() => flattenTree(pageTree), [pageTree])
  const defaultRolePermissions = useMemo(() => getDefaultRolePagePermissions(), [])
  const [permissions, setPermissions] = useState<RolePermissionNamesState>(EMPTY_ROLE_PERMISSION_NAMES)
  const [roleIds, setRoleIds] = useState<RoleIdsState>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const next: Record<string, boolean> = {}
    pageTree.forEach((group) => {
      next[group.id] = true
      group.children?.forEach((child) => {
        next[child.id] = true
      })
    })
    return next
  })

  const syncStateFromMatrix = useCallback(
    (
      permissionsList: PermissionRecord[],
      roles: Array<{ id: number; name?: string | null; display_name?: string | null }>,
      matrix: Record<string, { permissions?: number[] }>
    ) => {
      const pagePermissions = permissionsList.filter(
        (permission) =>
          permission.group === PAGE_ACCESS_GROUP_NAME ||
          (permission.name && Object.values(PAGE_ACCESS_PERMISSION_BY_PATH).includes(permission.name))
      )
      const pagePermissionIdSet = new Set(pagePermissions.map((permission) => permission.id))
      const permissionNameById = new Map(
        pagePermissions
          .filter((permission): permission is PermissionRecord & { name: string } => Boolean(permission.name))
          .map((permission) => [permission.id, permission.name as string])
      )

      const nextRoleIds: RoleIdsState = {}
      const nextPermissions: RolePermissionNamesState = {
        Admin: [],
        Support: [],
        Seller: [],
        Staff: [],
        QC: [],
        Packing: [],
        Shipout: [],
      }

      roles.forEach((roleRecord) => {
        const resolvedRole = getLemiexRole(roleRecord.name || roleRecord.display_name)
        nextRoleIds[resolvedRole] = roleRecord.id
        const assignedIds = matrix[String(roleRecord.id)]?.permissions || []
        nextPermissions[resolvedRole] = assignedIds
          .filter((permissionId) => pagePermissionIdSet.has(permissionId))
          .map((permissionId) => permissionNameById.get(permissionId) || '')
          .filter(Boolean)
      })

      setPermissions(nextPermissions)
      setRoleIds(nextRoleIds)
    },
    []
  )

  const ensurePagePermissionsAndDefaults = useCallback(async () => {
    let matrixData = await fetchPermissionMatrix()
    let permissionsList = matrixData.permissions || []

    const missingDefinitions = Object.entries(PAGE_ACCESS_PERMISSION_BY_PATH)
      .filter(([, permissionName]) => !permissionsList.some((permission) => permission.name === permissionName))
      .map(([path]) => {
        const node = treeMap.get(path)
        return buildPagePermissionDefinition(path, node?.title || path)
      })

    if (missingDefinitions.length > 0) {
      for (const definition of missingDefinitions) {
        await createPermission(definition)
      }
      matrixData = await fetchPermissionMatrix()
      permissionsList = matrixData.permissions || []
    }

    const pagePermissions = permissionsList.filter(
      (permission) =>
        permission.group === PAGE_ACCESS_GROUP_NAME ||
        (permission.name && Object.values(PAGE_ACCESS_PERMISSION_BY_PATH).includes(permission.name))
    )
    const pagePermissionIds = new Set(pagePermissions.map((permission) => permission.id))
    const permissionIdByName = new Map(
      pagePermissions
        .filter((permission): permission is PermissionRecord & { name: string } => Boolean(permission.name))
        .map((permission) => [permission.name as string, permission.id])
    )

    const initializationUpdates = MANAGEABLE_ROLES.flatMap((manageableRole) => {
      const roleRecord = (matrixData.roles || []).find(
        (item) => getLemiexRole(item.name || item.display_name) === manageableRole
      )

      if (!roleRecord) return []

      const currentIds = matrixData.matrix?.[String(roleRecord.id)]?.permissions || []
      const currentPageIds = currentIds.filter((permissionId) => pagePermissionIds.has(permissionId))
      if (currentPageIds.length > 0) return []

      const defaultIds = (defaultRolePermissions[manageableRole] || [])
        .map((permissionName) => permissionIdByName.get(permissionName))
        .filter((permissionId): permissionId is number => typeof permissionId === 'number')

      const mergedIds = Array.from(
        new Set([...currentIds.filter((permissionId) => !pagePermissionIds.has(permissionId)), ...defaultIds])
      )

      if (mergedIds.length === currentIds.length) return []

      return [{ roleId: roleRecord.id, permissionIds: mergedIds }]
    })

    if (initializationUpdates.length > 0) {
      for (const update of initializationUpdates) {
        await updateRolePermissions(update.roleId, update.permissionIds)
      }
      matrixData = await fetchPermissionMatrix()
      permissionsList = matrixData.permissions || []
    }

    syncStateFromMatrix(
      permissionsList,
      matrixData.roles || [],
      matrixData.matrix || {}
    )
  }, [defaultRolePermissions, syncStateFromMatrix, treeMap])

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/lemiex/dashboard')
      return
    }

    let active = true

    async function load() {
      try {
        setLoading(true)
        await ensurePagePermissionsAndDefaults()
      } catch (error) {
        const message = error instanceof Error ? error.message : m.initError
        toast.error(message)
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [ensurePagePermissionsAndDefaults, isAdmin, m.initError, router])

  function handleToggleRole(role: LemiexRole, permissionNames: string[], checked: boolean) {
    setPermissions((prev) => ({
      ...prev,
      [role]: togglePermissionNames(prev[role], permissionNames, checked),
    }))
  }

  function handleToggleExpand(nodeId: string) {
    setExpanded((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }))
  }

  async function handleSave() {
    if (!isAdmin) {
      router.replace('/lemiex/dashboard')
      return
    }

    try {
      setSaving(true)

      const matrixData = await fetchPermissionMatrix()
      const permissionsList = matrixData.permissions || []
      const pagePermissions = permissionsList.filter(
        (permission) =>
          permission.group === PAGE_ACCESS_GROUP_NAME ||
          (permission.name && Object.values(PAGE_ACCESS_PERMISSION_BY_PATH).includes(permission.name))
      )
      const pagePermissionIdsSet = new Set(pagePermissions.map((permission) => permission.id))
      const permissionIdByName = new Map(
        pagePermissions
          .filter((permission): permission is PermissionRecord & { name: string } => Boolean(permission.name))
          .map((permission) => [permission.name as string, permission.id])
      )

      for (const manageableRole of MANAGEABLE_ROLES) {
        const roleId = roleIds[manageableRole]
        if (!roleId) continue

        const existingIds = matrixData.matrix?.[String(roleId)]?.permissions || []
        const selectedIds = permissions[manageableRole]
          .map((permissionName) => permissionIdByName.get(permissionName))
          .filter((permissionId): permissionId is number => typeof permissionId === 'number')
        const mergedIds = Array.from(
          new Set([
            ...existingIds.filter((permissionId) => !pagePermissionIdsSet.has(permissionId)),
            ...selectedIds,
          ])
        )

        await updateRolePermissions(roleId, mergedIds)
      }

      await ensurePagePermissionsAndDefaults()
      toast.success(m.saved)
    } catch (error) {
      const message = error instanceof Error ? error.message : m.initError
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    if (!isAdmin) {
      router.replace('/lemiex/dashboard')
      return
    }

    setPermissions((prev) => {
      const next = { ...prev }
      MANAGEABLE_ROLES.forEach((manageableRole) => {
        next[manageableRole] = [...defaultRolePermissions[manageableRole]]
      })
      return next
    })

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
              onClick={() => void handleReset()}
              disabled={loading || saving}
            >
              <RotateCcw className='mr-2 size-4' />
              {m.reset}
            </Button>
            <Button
              className='h-10 rounded-[6px]'
              onClick={() => void handleSave()}
              disabled={loading || saving}
            >
              {saving ? <Loader2 className='mr-2 size-4 animate-spin' /> : <Save className='mr-2 size-4' />}
              {saving ? m.saving : m.save}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className='flex min-h-[240px] items-center justify-center rounded-[10px] border border-border/80 bg-background'>
            <div className='flex items-center gap-3 text-sm text-muted-foreground'>
              <Loader2 className='size-4 animate-spin' />
              {m.loading}
            </div>
          </div>
        ) : pageTree.length === 0 ? (
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
                {MANAGEABLE_ROLES.map((manageableRole) => (
                  <div
                    key={`head-${manageableRole}`}
                    className='px-3 py-3 text-center text-sm font-semibold'
                  >
                    {manageableRole}
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
