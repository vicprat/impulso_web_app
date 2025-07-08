'use client'

import { LogOut, ShoppingBag, User } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/modules/auth/context/useAuth'
import { ROUTES } from '@/src/config/routes'

export function UserMenu() {
  const { isAuthenticated, logout, user } = useAuth()

  if (isAuthenticated && user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='relative'>
            <User className='size-5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56'>
          <DropdownMenuLabel>Hola, {user.firstName ?? 'Usuario'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={ROUTES.CUSTOMER.DASHBOARD.PATH}>
              <User className='mr-2 size-4' />
              <span>Panel de usuario</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={ROUTES.ORDERS.MAIN.PATH}>
              <ShoppingBag className='mr-2 size-4' />
              <span>Mis pedidos</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className='mr-2 size-4' />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button variant='ghost' size='sm' asChild>
      <Link href={ROUTES.AUTH.LOGIN.PATH}>Iniciar sesión</Link>
    </Button>
  )
}
