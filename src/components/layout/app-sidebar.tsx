'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useLayout } from '@/context/layout-provider'
import { useI18n } from '@/context/i18n-provider'
import { useAuthStore } from '@/stores/auth-store'
import {
  getLemiexRole,
  subscribeToPageAccessChanges,
} from '@/features/lemiex/layout/sidebar-data'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  getSidebarNavGroups,
  getSidebarTeams,
  getSidebarUser,
} from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { type Team } from './types'

const ACTIVE_TEAM_STORAGE_KEY = 'active_team_id'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { locale } = useI18n()
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((state) => state.auth.user)
  const lemiexRole = getLemiexRole(user?.role)
  const teams = useMemo(() => getSidebarTeams(locale), [locale])
  const [selectedTeam, setSelectedTeam] = useState<Team>(teams[0])
  const [, setPageAccessVersion] = useState(0)

  useEffect(() => {
    queueMicrotask(() => {
      const savedTeamId = window.localStorage.getItem(ACTIVE_TEAM_STORAGE_KEY)
      const savedTeam = teams.find((team) => team.id === savedTeamId)
      if (savedTeam) {
        setSelectedTeam(savedTeam)
      }
    })
  }, [teams])

  useEffect(() => {
    window.localStorage.setItem(ACTIVE_TEAM_STORAGE_KEY, selectedTeam.id)
  }, [selectedTeam.id])

  useEffect(() => {
    return subscribeToPageAccessChanges(() => {
      setPageAccessVersion((value) => value + 1)
    })
  }, [])

  const handleTeamChange = (team: Team) => {
    setSelectedTeam(team)
    window.localStorage.setItem(ACTIVE_TEAM_STORAGE_KEY, team.id)
    router.push(team.defaultUrl)
  }

  const navGroups = getSidebarNavGroups(selectedTeam.id, locale, lemiexRole)
  const sidebarUser = getSidebarUser(selectedTeam.id)

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher
          teams={teams}
          activeTeam={selectedTeam}
          onTeamChange={handleTeamChange}
        />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
