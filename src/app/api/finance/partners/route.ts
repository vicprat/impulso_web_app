import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'
import { ROLES } from '@/src/config/Roles'

export async function GET() {
  await requirePermission(PERMISSIONS.VIEW_FINANCIAL_ENTRIES)
  const partners = await prisma.user.findMany({
    where: { UserRole: { some: { role: { name: ROLES.PARTNER.NAME } } } },
  })
  return NextResponse.json(partners)
}

export async function POST(request: NextRequest) {
  await requirePermission(PERMISSIONS.MANAGE_PARTNERS)
  const data = await request.json()
  const partner = await prisma.user.create({ data })
  return NextResponse.json(partner)
}
