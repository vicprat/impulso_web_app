'use client'

import { PanelLeft } from 'lucide-react'

import { Breadcrumbs } from '../Navigation/Breadcrumbs'
import { Button } from '../ui/button'
import { SearchTrigger } from './components/SearchTrigger'
import { ThemeSwitch } from './components/ThemeSwitch'

import { MiniCart } from '@/components/Cart/MiniCart'
import { useSidebar } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/modules/user/hooks/management'

const AuthenticatedSkeleton = () => (
  <div className='border-b shadow-sm'>
    <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
      <div className='flex items-center justify-between py-4'>
        <div>
          <Skeleton className='mb-2 h-8 w-64 bg-secondary-foreground' />
          <Skeleton className='h-4 w-48 bg-secondary-foreground' />
        </div>
      </div>
    </div>
  </div>
)

export const Authenticated = () => {
  const { currentUser, isLoading: userLoading } = useCurrentUser()

  const { toggleSidebar } = useSidebar()

  if (userLoading) {
    return <AuthenticatedSkeleton />
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className='shadow-sm '>
      <div className=' mx-auto px-4'>
        <div className='flex items-center justify-between py-4'>
          <div>
            <h1 className='text-2xl font-bold'>
              <Button onClick={toggleSidebar} variant='ghost'>
                <PanelLeft />
              </Button>
              Bienvenido, {currentUser.firstName ?? currentUser.email}
            </h1>
          </div>
          <SearchTrigger />

          <div className='flex items-center space-x-2'>
            <MiniCart />
            <ThemeSwitch />
          </div>
        </div>
      </div>
      <div className=' mx-auto px-4 py-2 sm:px-6 lg:px-8'>
        <Breadcrumbs />
      </div>
    </div>
  )
}
