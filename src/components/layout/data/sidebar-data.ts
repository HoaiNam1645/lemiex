import * as React from 'react'
import {
  Bell,
  HelpCircle,
  LayoutDashboard,
  ListTodo,
  Package,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react'
import type { AppLocale } from '@/lib/i18n/types'
import { type NavGroup, type SidebarData, type TeamId, type Team } from '../types'
import { getLemiexNavGroups, getLemiexRole, getLemiexTeam } from '@/features/lemiex/layout/sidebar-data'
import { type LemiexRole } from '@/stores/auth-store'

function WorkspaceLogo(props: React.ComponentProps<'div'>) {
  const { className, ...rest } = props

  return React.createElement(
    'div',
    { className, ...rest },
    React.createElement(ShieldCheck, {
      className: 'size-4',
    })
  )
}

function getTeams(_locale: AppLocale): Team[] {
  const labels = {
    vi: {
      teamName: 'Không gian quản trị',
      teamPlan: 'Next.js + shadcn/ui',
    },
    en: {
      teamName: 'Admin Workspace',
      teamPlan: 'Next.js + shadcn/ui',
    },
  }[_locale]

  return [
    {
      id: 'workspace',
      name: labels.teamName,
      logo: WorkspaceLogo,
      plan: labels.teamPlan,
      defaultUrl: '/tasks',
    },
    getLemiexTeam(_locale),
  ]
}

function getWorkspaceNavGroups(locale: AppLocale): NavGroup[] {
  const labels = {
    vi: {
      general: 'Tổng quan',
      overview: 'Tổng quan',
      tasks: 'Công việc',
      apps: 'Ứng dụng',
      users: 'Người dùng',
      support: 'Hỗ trợ',
      helpCenter: 'Trung tâm trợ giúp',
      notifications: 'Thông báo',
      settings: 'Cài đặt',
      profile: 'Hồ sơ',
    },
    en: {
      general: 'General',
      overview: 'Overview',
      tasks: 'Tasks',
      apps: 'Apps',
      users: 'Users',
      support: 'Support',
      helpCenter: 'Help Center',
      notifications: 'Notifications',
      settings: 'Settings',
      profile: 'Profile',
    },
  }[locale]

  return [
    {
      title: labels.general,
      items: [
        {
          title: labels.overview,
          url: '/tasks',
          icon: LayoutDashboard,
        },
        {
          title: labels.tasks,
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: labels.apps,
          url: '/apps',
          icon: Package,
        },
        {
          title: labels.users,
          url: '/users',
          icon: Users,
        },
      ],
    },
    {
      title: labels.support,
      items: [
        {
          title: labels.helpCenter,
          url: '/help-center',
          icon: HelpCircle,
        },
        {
          title: labels.notifications,
          url: '/settings/notifications',
          icon: Bell,
        },
      ],
    },
    {
      title: labels.settings,
      items: [
        {
          title: labels.profile,
          url: '/settings',
          icon: Settings,
        },
      ],
    },
  ]
}

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: getTeams('vi'),
  navGroups: getWorkspaceNavGroups('vi'),
}

export function getSidebarTeams(locale: AppLocale = 'vi') {
  return getTeams(locale)
}

export function getSidebarNavGroups(
  teamId: TeamId,
  locale: AppLocale = 'vi',
  role: LemiexRole = 'Admin'
) {
  if (teamId === 'lemiex') {
    return getLemiexNavGroups(locale, getLemiexRole(role))
  }

  return getWorkspaceNavGroups(locale)
}

export function getSidebarUser(teamId: TeamId) {
  if (teamId === 'lemiex') {
    return {
      name: 'Lemiex Admin',
      email: 'lemiex@workspace.local',
      avatar: '/avatars/shadcn.jpg',
    }
  }

  return {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  }
}
