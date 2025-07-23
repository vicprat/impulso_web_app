import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requirePermission(PERMISSIONS.VIEW_FINANCIAL_ENTRIES)
  const { id } = await params
  const account = await prisma.bankAccount.findUnique({ where: { id } })
  if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(account)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requirePermission(PERMISSIONS.MANAGE_BANK_ACCOUNTS)
  const { id } = await params
  const data = await request.json()
  const account = await prisma.bankAccount.update({ data, where: { id } })
  return NextResponse.json(account)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requirePermission(PERMISSIONS.MANAGE_BANK_ACCOUNTS)
  const { id } = await params
  await prisma.bankAccount.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
