import { NextResponse } from 'next/server'

import { PERMISSIONS } from '@/config/Permissions'
import { requirePermission } from '@/modules/auth/server/server'
import { blogService } from '@/modules/blog/service'

export async function GET() {
  try {
    const items = await blogService.listCategories()
    return NextResponse.json(items)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al listar categorías'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function POST(request: Request) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_ALL_BLOG_POSTS)
    const body = await request.json()
    const created = await blogService.createCategory(body)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear categoría'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
