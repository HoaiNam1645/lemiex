import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'lemiex_access_token'
const AUTH_USER = 'lemiex_auth_user'

export type LemiexRole =
  | 'Admin'
  | 'Support'
  | 'Seller'
  | 'Staff'
  | 'QC'
  | 'Packing'
  | 'Shipout'

export interface AuthUser {
  id?: number | string
  accountNo?: string | null
  username?: string | null
  name?: string | null
  full_name?: string | null
  email?: string | null
  created_at?: string | null
  profile?: Record<string, unknown> | null
  role?:
    | {
        name?: LemiexRole | string
        display_name?: string
        permissions?: Array<{
          id?: number
          name?: string | null
          display_name?: string | null
          group?: string | null
          route?: string | null
          method?: string | null
        }>
      }
    | LemiexRole
    | string
    | null
  role_name?: LemiexRole | string | null
  exp?: number | null
  [key: string]: unknown
}

interface AuthState {
  auth: {
    hydrated: boolean
    hydrate: () => void
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

function readStoredUser() {
  if (typeof window === 'undefined') return null

  const userState = window.localStorage.getItem(AUTH_USER)
  if (!userState) return null

  try {
    return JSON.parse(userState) as AuthUser
  } catch {
    window.localStorage.removeItem(AUTH_USER)
    return null
  }
}

function readStoredToken() {
  if (typeof window === 'undefined') return ''

  const storedToken = window.localStorage.getItem(ACCESS_TOKEN)
  if (storedToken) return storedToken

  const cookieState = getCookie(ACCESS_TOKEN)
  if (!cookieState) return ''

  try {
    return JSON.parse(cookieState) as string
  } catch {
    return cookieState
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  return {
    auth: {
      hydrated: false,
      hydrate: () =>
        set((state) => ({
          ...state,
          auth: {
            ...state.auth,
            hydrated: true,
            user: readStoredUser(),
            accessToken: readStoredToken(),
          },
        })),
      user: null,
      setUser: (user) =>
        set((state) => {
          if (typeof window !== 'undefined') {
            if (user) {
              window.localStorage.setItem(AUTH_USER, JSON.stringify(user))
            } else {
              window.localStorage.removeItem(AUTH_USER)
            }
          }

          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: '',
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(ACCESS_TOKEN, accessToken)
          }
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(ACCESS_TOKEN)
          }
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(ACCESS_TOKEN)
            window.localStorage.removeItem(AUTH_USER)
          }
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})
