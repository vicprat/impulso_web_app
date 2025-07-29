'use client'

import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { Logo } from '@/components/Logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sidebar, SidebarContent, SidebarFooter, SidebarMenu } from '@/components/ui/sidebar'
import { getGroupedDashboardNavRoutes, ROUTES, type RouteConfig } from '@/config/routes'
import { useAuth } from '@/modules/auth/context/useAuth'

import { MenuGroup } from './MenuGroup'
import { MenuItem } from './MenuItem'

interface Props {
  routes: RouteConfig[]
}

export const AppSidebar: React.FC<Props> = ({ routes }) => {
  const pathname = usePathname()
  const router = useRouter()

  const { isLoading, logout, user } = useAuth()

  const [visibleRoutes, setVisibleRoutes] = useState<RouteConfig[]>([])
  const [groupedRoutes, setGroupedRoutes] = useState<RouteConfig[]>([])
  const [individualRoutes, setIndividualRoutes] = useState<RouteConfig[]>([])

  useEffect(() => {
    if (isLoading || !user) return

    const userRoles = user.roles
    const userPermissions = user.permissions
    const { groupedRoutes, individualRoutes } = getGroupedDashboardNavRoutes(userRoles, userPermissions)
    
    setGroupedRoutes(groupedRoutes)
    setIndividualRoutes(individualRoutes)
    setVisibleRoutes([...groupedRoutes, ...individualRoutes])
  }, [user, isLoading, routes])

  const handleLogout = () => {
    void logout()
    router.push(ROUTES.AUTH.LOGIN.PATH)
  }

  const renderRoute = (route: RouteConfig) => {
    if (route.HIDE_IN_NAV) return null

    const isActive = pathname === route.PATH || pathname.startsWith(`${route.PATH}/`)

    return <MenuItem key={route.PATH} route={route} isActive={isActive} />
  }

  return (
    <Sidebar className='h-screen' collapsible='offcanvas' variant='floating'>
      <div className='flex items-center justify-between border-b px-4 py-2'>
        <Logo />
      </div>

      <SidebarContent className='mt-4'>
        <SidebarMenu>
          {/* Rutas individuales */}
          {individualRoutes.map(renderRoute)}
          
          {/* Grupo de Administración */}
          {groupedRoutes.length > 0 && (
            <MenuGroup 
              route={ROUTES.ADMIN.GROUP} 
              children={groupedRoutes}
            />
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className='border-t'>
        <div className='flex w-full flex-col'>
          <Link
            href={ROUTES.CUSTOMER.PROFILE.PATH}
            className={`flex items-center p-2 text-sm hover:bg-accent hover:text-accent-foreground ${pathname === ROUTES.CUSTOMER.PROFILE.PATH ? 'bg-accent text-accent-foreground' : ''}`}
          >
            <Avatar className='size-8 min-h-8 min-w-8'>
              <AvatarImage src={user?.profile?.avatarUrl ?? ''} alt={user?.firstName ?? ''} />
              <AvatarFallback>{user?.firstName?.[0] ?? 'U'}</AvatarFallback>
            </Avatar>
            <div className='ml-3 overflow-hidden group-data-[collapsible=icon]:hidden'>
              <span className='block truncate text-sm font-medium'>
                {user?.firstName ?? user?.email}
              </span>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className='flex items-center p-2 text-left text-sm hover:bg-accent hover:text-accent-foreground'
          >
            <LogOut className='mr-3 size-4' />
            <span className='group-data-[collapsible=icon]:hidden'>Cerrar sesión</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
