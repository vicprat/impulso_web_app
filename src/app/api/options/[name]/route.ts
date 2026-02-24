import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { PERMISSIONS } from '@/src/config/Permissions'
import { requirePermission } from '@/src/modules/auth/server/server'

const TABLE_MAP: Record<string, string> = {
  arrendamientos: 'Arrendamiento',
  artwork_types: 'ArtworkType',
  locations: 'Location',
  techniques: 'Technique',
}

// Define a type for model names only
type ModelName = 'Technique' | 'ArtworkType' | 'Location' | 'Arrendamiento'

export async function GET(req: Request, context: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await context.params

    // Validar que el parámetro name existe
    if (!name) {
      return NextResponse.json({ error: 'El parámetro "name" es requerido' }, { status: 400 })
    }

    const tableName = TABLE_MAP[name]

    if (!tableName) {
      return NextResponse.json(
        {
          error: 'Tipo de opción inválido',
          received: name,
          validOptions: Object.keys(TABLE_MAP),
        },
        { status: 400 }
      )
    }

    // Verificar que el modelo existe en Prisma
    if (!(prisma as any)[tableName]) {
      console.error(`Modelo ${tableName} no encontrado en Prisma`)
      return NextResponse.json({ error: 'Error interno: modelo no disponible' }, { status: 500 })
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

    // Manejo específico de errores de Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unknown table')) {
        return NextResponse.json(
          { error: 'Error de base de datos: tabla no encontrada' },
          { status: 500 }
        )
      }

      if (error.message.includes('Connection')) {
        return NextResponse.json({ error: 'Error de conexión a la base de datos' }, { status: 503 })
      }

      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Timeout en la consulta de base de datos' },
          { status: 504 }
        )
      }
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: Request, context: { params: Promise<{ name: string }> }) {
  try {
    await requirePermission([PERMISSIONS.MANAGE_INVENTORY, PERMISSIONS.MANAGE_OWN_PRODUCTS])
    const { name: optionType } = await context.params

    // Validar que el parámetro name existe
    if (!optionType) {
      return NextResponse.json({ error: 'El parámetro "name" es requerido' }, { status: 400 })
    }

    const tableName = TABLE_MAP[optionType]

    if (!tableName) {
      return NextResponse.json(
        {
          error: 'Tipo de opción inválido',
          received: optionType,
          validOptions: Object.keys(TABLE_MAP),
        },
        { status: 400 }
      )
    }

    // Verificar que el modelo existe en Prisma
    if (!(prisma as any)[tableName]) {
      console.error(`Modelo ${tableName} no encontrado en Prisma`)
      return NextResponse.json({ error: 'Error interno: modelo no disponible' }, { status: 500 })
    }

    const body = await req.json()
    const { name } = body

    // Validar el body de la request
    if (!name) {
      return NextResponse.json(
        { error: 'El campo "name" es requerido en el body' },
        { status: 400 }
      )
    }

    if (typeof name !== 'string') {
      return NextResponse.json(
        { error: 'El campo "name" debe ser una cadena de texto' },
        { status: 400 }
      )
    }

    if (name.trim() === '') {
      return NextResponse.json({ error: 'El campo "name" no puede estar vacío' }, { status: 400 })
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'El campo "name" no puede exceder 100 caracteres' },
        { status: 400 }
      )
    }

    // Verificar si ya existe
    const existing = await (prisma as any)[tableName as ModelName].findFirst({
      where: { name: name.trim() },
    })

    if (existing) {
      return NextResponse.json(
        {
          error: `El valor "${name.trim()}" ya existe`,
          existingId: existing.id,
        },
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

    // Manejo específico de errores de Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unknown table')) {
        return NextResponse.json(
          { error: 'Error de base de datos: tabla no encontrada' },
          { status: 500 }
        )
      }

      if (error.message.includes('Connection')) {
        return NextResponse.json({ error: 'Error de conexión a la base de datos' }, { status: 503 })
      }

      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'El valor ya existe en la base de datos' },
          { status: 409 }
        )
      }

      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Timeout en la consulta de base de datos' },
          { status: 504 }
        )
      }
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(req: Request, context: { params: Promise<{ name: string }> }) {
  try {
    await requirePermission([PERMISSIONS.MANAGE_INVENTORY, PERMISSIONS.MANAGE_OWN_PRODUCTS])
    const { name: optionType } = await context.params

    if (!optionType) {
      return NextResponse.json({ error: 'El parámetro "name" es requerido' }, { status: 400 })
    }

    const tableName = TABLE_MAP[optionType]

    if (!tableName) {
      return NextResponse.json(
        {
          error: 'Tipo de opción inválido',
          received: optionType,
          validOptions: Object.keys(TABLE_MAP),
        },
        { status: 400 }
      )
    }

    if (!(prisma as any)[tableName]) {
      console.error(`Modelo ${tableName} no encontrado en Prisma`)
      return NextResponse.json({ error: 'Error interno: modelo no disponible' }, { status: 500 })
    }

    const body = await req.json()
    const { id, name } = body

    if (!id) {
      return NextResponse.json({ error: 'El campo "id" es requerido en el body' }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json(
        { error: 'El campo "name" es requerido en el body' },
        { status: 400 }
      )
    }

    if (typeof name !== 'string') {
      return NextResponse.json(
        { error: 'El campo "name" debe ser una cadena de texto' },
        { status: 400 }
      )
    }

    if (name.trim() === '') {
      return NextResponse.json({ error: 'El campo "name" no puede estar vacío' }, { status: 400 })
    }

    const existing = await (prisma as any)[tableName as ModelName].findFirst({
      where: {
        NOT: { id },
        name: name.trim(),
      },
    })

    if (existing) {
      return NextResponse.json({ error: `El valor "${name.trim()}" ya existe` }, { status: 409 })
    }

    const data = await (prisma as any)[tableName as ModelName].update({
      data: { name: name.trim() },
      select: { id: true, name: true },
      where: { id },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating option:', error)

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ name: string }> }) {
  try {
    await requirePermission([PERMISSIONS.MANAGE_INVENTORY, PERMISSIONS.MANAGE_OWN_PRODUCTS])
    const { name: optionType } = await context.params

    if (!optionType) {
      return NextResponse.json({ error: 'El parámetro "name" es requerido' }, { status: 400 })
    }

    const tableName = TABLE_MAP[optionType]

    if (!tableName) {
      return NextResponse.json(
        {
          error: 'Tipo de opción inválido',
          received: optionType,
          validOptions: Object.keys(TABLE_MAP),
        },
        { status: 400 }
      )
    }

    if (!(prisma as any)[tableName]) {
      console.error(`Modelo ${tableName} no encontrado en Prisma`)
      return NextResponse.json({ error: 'Error interno: modelo no disponible' }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'El parámetro "id" es requerido' }, { status: 400 })
    }

    await (prisma as any)[tableName as ModelName].update({
      data: { isActive: false },
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting option:', error)

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
