'use client'

import { usePathname } from 'next/navigation'
import { Link } from '@/lib/router'
import useDialogState from '@/hooks/use-dialog-state'
import { useI18n } from '@/context/i18n-provider'
import { useAuthStore, type LemiexRole } from '@/stores/auth-store'
import { getLemiexRole } from '@/features/lemiex/layout/sidebar-data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const { messages } = useI18n()
  const pathname = usePathname()
  const authUser = useAuthStore((state) => state.auth.user)
  const setRole = useAuthStore((state) => state.auth.setRole)
  const activeRole = getLemiexRole(authUser?.role)
  const isLemiexRoute = pathname.startsWith('/lemiex')
  const lemiexRoles: LemiexRole[] = [
    'Admin',
    'Support',
    'Seller',
    'Staff',
    'QC',
    'Packing',
    'Shipout',
  ]

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src='/logo.jpg' alt='Shadcn Admin logo' />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1.5'>
              <p className='text-sm leading-none font-medium'>
                {authUser?.email ? authUser.email.split('@')[0] : 'satnaing'}
              </p>
              <p className='text-xs leading-none text-muted-foreground'>
                {isLemiexRoute ? `${activeRole} role` : (authUser?.email ?? 'satnaingdev@gmail.com')}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                {messages.profile.manageProfile}
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to='/settings/notifications'>
                {messages.profile.notifications}
                <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {isLemiexRoute ? (
            <>
              <DropdownMenuLabel className='px-2 pb-1 text-xs text-muted-foreground'>
                Lemiex role
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={activeRole}
                onValueChange={(value) => setRole(value as LemiexRole)}
              >
                {lemiexRoles.map((role) => (
                  <DropdownMenuRadioItem key={role} value={role}>
                    {role}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
            </>
          ) : null}
          <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
            {messages.profile.signOut}
            <DropdownMenuShortcut className='text-current'>
              ⇧⌘Q
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
