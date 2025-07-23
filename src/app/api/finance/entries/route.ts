import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function GET() {
  await requirePermission(PERMISSIONS.VIEW_FINANCIAL_ENTRIES)
  const entries = await prisma.financialEntry.findMany()
  return NextResponse.json(entries)
}

export async function POST(request: NextRequest) {
  await requirePermission(PERMISSIONS.MANAGE_FINANCIAL_ENTRIES)
  const data = await request.json()
  const entry = await prisma.financialEntry.create({ data })
  return NextResponse.json(entry)
}
