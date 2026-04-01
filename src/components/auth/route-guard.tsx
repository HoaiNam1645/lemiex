'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  canAccessLemiexPath,
  getDefaultLemiexRoute,
  getLemiexRole,
} from '@/features/lemiex/layout/sidebar-data'
import { useAuthStore } from '@/stores/auth-store'

type RouteGuardProps = {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const hydrated = useAuthStore((state) => state.auth.hydrated)
  const accessToken = useAuthStore((state) => state.auth.accessToken)
  const user = useAuthStore((state) => state.auth.user)

  useEffect(() => {
    if (!hydrated) return

    const currentSearch = searchParams.toString()
    const currentPath = currentSearch ? `${pathname}?${currentSearch}` : pathname

    if (!accessToken) {
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }

    if (!user) return

    if (!pathname.startsWith('/lemiex')) return

    const role = getLemiexRole(user?.role)
    if (canAccessLemiexPath(role, pathname)) return

    router.replace(getDefaultLemiexRoute(role))
  }, [accessToken, hydrated, pathname, router, searchParams, user?.role])

  if (!hydrated) return null
  if (!accessToken) return null
  if (!user) return null

  if (pathname.startsWith('/lemiex')) {
    const role = getLemiexRole(user?.role)
    if (!canAccessLemiexPath(role, pathname)) return null
  }

  return <>{children}</>
}
