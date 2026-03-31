'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AppLocale } from '@/lib/i18n/types'

const LOCALE_STORAGE_KEY = 'app_locale'

const uiMessages = {
  vi: {
    language: {
      label: 'Đổi ngôn ngữ',
      vietnamese: 'Tiếng Việt',
      english: 'Tiếng Anh',
    },
    command: {
      placeholder: 'Tìm màn hình hoặc thao tác...',
      empty: 'Không tìm thấy kết quả.',
      theme: 'Giao diện',
      light: 'Sáng',
      dark: 'Tối',
      system: 'Theo hệ thống',
    },
    profile: {
      manageProfile: 'Hồ sơ cá nhân',
      billing: 'Thanh toán',
      notifications: 'Thông báo',
      signOut: 'Đăng xuất',
    },
  },
  en: {
    language: {
      label: 'Change language',
      vietnamese: 'Vietnamese',
      english: 'English',
    },
    command: {
      placeholder: 'Search screens or actions...',
      empty: 'No results found.',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    profile: {
      manageProfile: 'Profile',
      billing: 'Billing',
      notifications: 'Notifications',
      signOut: 'Sign out',
    },
  },
} satisfies Record<AppLocale, {
  language: {
    label: string
    vietnamese: string
    english: string
  }
  command: {
    placeholder: string
    empty: string
    theme: string
    light: string
    dark: string
    system: string
  }
  profile: {
    manageProfile: string
    billing: string
    notifications: string
    signOut: string
  }
}>

type I18nContextType = {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  messages: (typeof uiMessages)[AppLocale]
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>('vi')

  useEffect(() => {
    queueMicrotask(() => {
      const savedLocale = window.localStorage.getItem(
        LOCALE_STORAGE_KEY
      ) as AppLocale | null

      if (savedLocale === 'vi' || savedLocale === 'en') {
        setLocaleState(savedLocale)
        return
      }

      const browserLocale = navigator.language.toLowerCase()
      if (browserLocale.startsWith('en')) {
        setLocaleState('en')
      }
    })
  }, [])

  const setLocale = (nextLocale: AppLocale) => {
    setLocaleState(nextLocale)
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
  }

  const value = useMemo<I18nContextType>(
    () => ({
      locale,
      setLocale,
      messages: uiMessages[locale],
    }),
    [locale]
  )

  return <I18nContext value={value}>{children}</I18nContext>
}

export function useI18n() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }

  return context
}
