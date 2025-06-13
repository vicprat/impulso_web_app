'use client';

import { ROUTES } from '@/types/routes';
import { Guard } from '@/components/Guards';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UsersPage() {

  return (
    <Guard.Permission permission="manage_users">
      <div className="space-y-6">
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <Link href={ROUTES.ADMIN_ROLES}>
            <Button>Gestionar Roles</Button>
          </Link>
        </div>
        
        {/* Contenido de la página */}
      </div>
    </Guard.Permission>
  );
}