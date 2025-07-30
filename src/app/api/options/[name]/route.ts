import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { PERMISSIONS } from '@/src/config/Permissions'
import { requirePermission } from '@/src/modules/auth/server/server'

const TABLE_MAP: Record<string, string> = {
  artwork_types: 'artworkType',
  locations: 'location',
  techniques: 'technique',
}

// Define a type for model names only
type ModelName = 'technique' | 'artworkType' | 'location'

export async function GET(
  req: Request,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await context.params
    const tableName = TABLE_MAP[name]

    if (!tableName) {
      return NextResponse.json({ error: 'Invalid option type' }, { status: 400 })
    }

    // Type assertion to specific model names
    const data = await (prisma as any)[tableName as ModelName].findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
      where: { isActive: true },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching options:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ name: string }> }
) {
  try {
    // Verificar permisos de administrador
    const session = await requirePermission([PERMISSIONS.MANAGE_INVENTORY, PERMISSIONS.MANAGE_OWN_PRODUCTS])
    const { name: optionType } = await context.params
    const tableName = TABLE_MAP[optionType]

    if (!tableName) {
      return NextResponse.json({ error: 'Invalid option type' }, { status: 400 })
    }

    const { name } = await req.json()
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Verificar si ya existe
    const existing = await (prisma as any)[tableName as ModelName].findFirst({
      where: { name: name.trim() },
    })

    if (existing) {
      return NextResponse.json(
        { error: `El valor "${name}" ya existe.` },
        { status: 409 }
      )
    }

    const data = await (prisma as any)[tableName as ModelName].create({
      data: { name: name.trim() },
      select: { id: true, name: true },
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating option:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}