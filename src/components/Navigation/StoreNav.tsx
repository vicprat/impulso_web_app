'use client'

import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { useRoutes } from '@/hooks/useRoutes'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/src/config/routes'
import { useCart } from '@/src/modules/cart/hook'

export const StoreNav = () => {
  const pathname = usePathname()
  const { storeNavRoutes } = useRoutes()
  const { data } = useCart()

  return (
    <nav className='flex items-center space-x-6'>
      {storeNavRoutes.map((route) => (
        <Link
          key={route.PATH}
          href={route.PATH}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === route.PATH ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {route.LABEL}
        </Link>
      ))}

      <Link href={ROUTES.STORE.CART.PATH}>
        <Button variant='ghost' size='icon' className='relative'>
          <ShoppingCart className='size-5' />
          {(data?.totalQuantity ?? 0) > 0 && (
            <span className='absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground'>
              {data?.totalQuantity ?? 0}
            </span>
          )}
        </Button>
      </Link>
    </nav>
  )
}
