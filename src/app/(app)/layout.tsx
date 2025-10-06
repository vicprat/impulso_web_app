'use client'

import { WelcomeCouponDialog } from '@/components/Dialog/WelcomeCouponDialog'
import { Guard } from '@/components/Guards'
import { Header } from '@/components/Header'
import { AppSidebar } from '@/components/Sidebar/Sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { getAllRoutes } from '@/config/routes'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Guard.Route>
      <SidebarProvider>
        <div className='flex h-screen w-full'>
          <AppSidebar routes={getAllRoutes()} />

          <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
            <Header.Authenticated />

            <div className='flex-1 overflow-x-auto'>{children}</div>
          </div>
        </div>

        <WelcomeCouponDialog />
      </SidebarProvider>
    </Guard.Route>
  )
}
