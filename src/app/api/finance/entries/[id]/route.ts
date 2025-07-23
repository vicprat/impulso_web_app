import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requirePermission(PERMISSIONS.VIEW_FINANCIAL_ENTRIES)
  const { id } = await params
  const entry = await prisma.financialEntry.findUnique({ where: { id } })
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(entry)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requirePermission(PERMISSIONS.MANAGE_FINANCIAL_ENTRIES)
  const { id } = await params
  const data = await request.json()
  const entry = await prisma.financialEntry.update({ data, where: { id } })
  return NextResponse.json(entry)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requirePermission(PERMISSIONS.MANAGE_FINANCIAL_ENTRIES)
  const { id } = await params
  await prisma.financialEntry.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
