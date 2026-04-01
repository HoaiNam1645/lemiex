'use client'

import { useEffect } from 'react'
import { fetchCurrentUser } from '@/services/auth/api'
import { useAuthStore } from '@/stores/auth-store'

export function AuthBootstrap() {
  const hydrate = useAuthStore((state) => state.auth.hydrate)
  const hydrated = useAuthStore((state) => state.auth.hydrated)
  const accessToken = useAuthStore((state) => state.auth.accessToken)
  const user = useAuthStore((state) => state.auth.user)
  const setUser = useAuthStore((state) => state.auth.setUser)
  const reset = useAuthStore((state) => state.auth.reset)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!hydrated || !accessToken || user) return

    let cancelled = false

    fetchCurrentUser()
      .then((result) => {
        if (cancelled || !result.success || !result.user) {
          if (!cancelled) reset()
          return
        }

        if (!cancelled) {
          setUser(result.user)
        }
      })
      .catch(() => {
        if (!cancelled) reset()
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, hydrated, reset, setUser, user])

  return null
}
