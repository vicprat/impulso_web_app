'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

import { Sidebar, SidebarContent, SidebarFooter, SidebarMenu } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { MenuItem } from './MenuItem';
import { useAuth } from '@/modules/auth/context/useAuth';
import { getDashboardNavRoutes, RouteConfig } from '@/config/routes';
import { MenuGroup } from './MenuGroup';
import { Logo } from '../Header/components/Logo';

type Props = {
  routes: RouteConfig[];
};

export const AppSidebar: React.FC<Props> = ({ routes }) => {
  const pathname = usePathname();
  const router = useRouter();
  
  const { user, logout, isLoading } = useAuth(); 

  const [visibleRoutes, setVisibleRoutes] = useState<RouteConfig[]>([]);

  useEffect(() => {
    if (isLoading || !user) return;
    
    const userRoles = user.roles || []; 
    const userPermissions = user.permissions || []; 
    const accessibleRoutes = getDashboardNavRoutes(userRoles, userPermissions);
    setVisibleRoutes(accessibleRoutes);

  }, [user, isLoading, routes]);

  const handleLogout = () => {
    logout(); 
    router.push('/auth/login');
  };

  return (
    <Sidebar className="h-screen" collapsible="offcanvas" variant="floating">
      <div className="flex items-center justify-between px-4 py-2 border-b">
      <Logo />
      </div>
      
      <SidebarContent className='mt-4'>
        <SidebarMenu>
          {visibleRoutes.map(route => {
            if (route.hideInNav) return null;
            
            const isActive = pathname === route.path || pathname.startsWith(`${route.path}/`);
            
            if (route.children && route.children.some(c => !c.hideInNav)) {
              return <MenuGroup key={route.path} route={route} />;
            }
            
            return <MenuItem key={route.path} route={route} isActive={isActive} />;
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t">
        <div className="flex flex-col w-full">
           <Link 
             href="/profile"
             className={`flex items-center p-2 text-sm hover:bg-accent hover:text-accent-foreground ${pathname === '/profile' ? 'bg-accent text-accent-foreground' : ''}`}
           >
             <Avatar className="h-8 w-8 min-w-[2rem] min-h-[2rem]">
               <AvatarImage src={user?.avatarUrl ?? ''} alt={user?.firstName ?? ''} />
               <AvatarFallback>{user?.firstName?.[0] || 'U'}</AvatarFallback>
             </Avatar>
             <div className="ml-3 group-data-[collapsible=icon]:hidden overflow-hidden">
               <span className="text-sm font-medium truncate block">
                 {user?.firstName || user?.email}
               </span>
             </div>
           </Link>
          
          
           <button 
             onClick={handleLogout}
             className="flex items-center p-2 text-sm text-left hover:bg-accent hover:text-accent-foreground"
           >
             <LogOut className="h-4 w-4 mr-3" />
             <span className="group-data-[collapsible=icon]:hidden">Cerrar sesión</span>
           </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};