import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function GET() {
  await requirePermission(PERMISSIONS.VIEW_FINANCIAL_ENTRIES)
  const accounts = await prisma.bankAccount.findMany()
  return NextResponse.json(accounts)
}

export async function POST(request: NextRequest) {
  await requirePermission(PERMISSIONS.MANAGE_BANK_ACCOUNTS)
  const data = await request.json()
  const account = await prisma.bankAccount.create({ data })
  return NextResponse.json(account)
}
