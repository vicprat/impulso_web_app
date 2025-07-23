import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'
import { ROLES } from '@/src/config/Roles'

export async function GET() {
  await requirePermission(PERMISSIONS.VIEW_FINANCIAL_ENTRIES)
  const providers = await prisma.user.findMany({
    where: { UserRole: { some: { role: { name: ROLES.PROVIDER.NAME } } } },
  })
  return NextResponse.json(providers)
}

export async function POST(request: NextRequest) {
  await requirePermission(PERMISSIONS.MANAGE_PROVIDERS)
  const data = await request.json()
  const provider = await prisma.user.create({ data })
  return NextResponse.json(provider)
}
