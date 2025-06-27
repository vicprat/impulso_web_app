'use client'

import Link from 'next/link'

import { Guard } from '@/components/Guards'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/types/routes'

export default function UsersPage() {
  return (
    <Guard.Permission permission='manage_users'>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold'>Gestión de Usuarios</h1>
          <Link href={ROUTES.ADMIN_ROLES}>
            <Button>Gestionar Roles</Button>
          </Link>
        </div>

        {/* Contenido de la página */}
      </div>
    </Guard.Permission>
  )
}
