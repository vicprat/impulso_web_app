// src/app/api/users/[id]/roles/route.ts
import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'
import { updateUserRole } from '@/modules/user/user.service' // ✅ Importar método actualizado

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requirePermission('manage_roles')

    const targetUserId = params.id
    const { role } = await request.json() // ✅ Recibir un solo rol

    if (!role || typeof role !== 'string') {
      return NextResponse.json({ error: 'Role debe ser un string válido' }, { status: 400 })
    }

    // Verificar que el rol existe
    const existingRole = await prisma.role.findUnique({
      where: { name: role },
    })

    if (!existingRole) {
      return NextResponse.json({ error: 'El rol no existe' }, { status: 400 })
    }

    const hasAdminRole = session.user.roles.includes('admin')
    const hasSuperAdminRole = session.user.roles.includes('super_admin')

    if (!hasSuperAdminRole) {
      const restrictedRoles = ['admin', 'super_admin']
      const isRestrictedRole = restrictedRoles.includes(role)

      if (isRestrictedRole && !hasAdminRole) {
        return NextResponse.json(
          {
            error: 'No tienes permisos para asignar roles administrativos',
          },
          { status: 403 }
        )
      }
    }

    // ✅ USAR: Método actualizado que maneja UserRole
    const updatedUser = await updateUserRole(targetUserId, role)

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
