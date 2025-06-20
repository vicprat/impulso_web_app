'use client';

import { SidebarProvider } from '@/components/ui/sidebar'; 
import { Guard } from '@/components/Guards';
import { AppSidebar } from '@/components/Sidebar/Sidebar';
import { AppRoutes } from '@/config/routes';
import { Header } from '@/components/Header';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Guard.Route> 
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-auto bg-background">
          
          <AppSidebar routes={AppRoutes} />
          
          <div className="flex flex-col flex-1 w-full h-full">
            
            <Header.Authenticated />
            
                {children}
          </div>

        </div>
      </SidebarProvider>
    </Guard.Route>
  );
}