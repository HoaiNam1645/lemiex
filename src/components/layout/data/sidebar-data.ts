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
  return [
    {
      id: 'workspace',
      name: 'Admin Workspace',
      logo: WorkspaceLogo,
      plan: 'Next.js + shadcn/ui',
      defaultUrl: '/tasks',
    },
    getLemiexTeam(),
  ]
}

function getWorkspaceNavGroups(_locale: AppLocale): NavGroup[] {
  return [
    {
      title: 'General',
      items: [
        {
          title: 'Overview',
          url: '/tasks',
          icon: LayoutDashboard,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'Apps',
          url: '/apps',
          icon: Package,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
        {
          title: 'Notifications',
          url: '/settings/notifications',
          icon: Bell,
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          title: 'Profile',
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
    return getLemiexNavGroups(getLemiexRole(role))
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
