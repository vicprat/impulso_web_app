import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'
import { ROLES } from '@/src/config/Roles'

export async function GET() {
  await requirePermission(PERMISSIONS.VIEW_FINANCIAL_ENTRIES)
  const employees = await prisma.user.findMany({
    where: { UserRole: { some: { role: { name: ROLES.EMPLOYEE.NAME } } } },
  })
  return NextResponse.json(employees)
}

export async function POST(request: NextRequest) {
  await requirePermission(PERMISSIONS.MANAGE_EMPLOYEES)
  const data = await request.json()
  const employee = await prisma.user.create({ data })
  return NextResponse.json(employee)
}
