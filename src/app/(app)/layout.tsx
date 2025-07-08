'use client'

import { Guard } from '@/components/Guards'
import { Header } from '@/components/Header'
import { AppSidebar } from '@/components/Sidebar/Sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { getAllRoutes } from '@/config/routes'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Guard.Route>
      <SidebarProvider>
        <div className='flex h-screen w-full overflow-auto bg-background'>
          <AppSidebar routes={getAllRoutes()} />

          <div className='flex size-full flex-1 flex-col'>
            <Header.Authenticated />

            {children}
          </div>
        </div>
      </SidebarProvider>
    </Guard.Route>
  )
}
