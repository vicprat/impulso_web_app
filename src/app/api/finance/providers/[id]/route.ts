import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requirePermission(PERMISSIONS.VIEW_FINANCIAL_ENTRIES)
  const { id } = await params
  const provider = await prisma.user.findUnique({ where: { id } })
  if (!provider) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(provider)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requirePermission(PERMISSIONS.MANAGE_PROVIDERS)
  const { id } = await params
  const data = await request.json()
  const provider = await prisma.user.update({ data, where: { id } })
  return NextResponse.json(provider)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requirePermission(PERMISSIONS.MANAGE_PROVIDERS)
  const { id } = await params
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
