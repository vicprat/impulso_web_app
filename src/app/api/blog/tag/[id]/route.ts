import { NextResponse } from 'next/server'

import { PERMISSIONS } from '@/config/Permissions'
import { requirePermission } from '@/modules/auth/server/server'
import { blogService } from '@/modules/blog/service'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const item = await blogService.getTagById(id)
    if (!item) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(item)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener tag'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_ALL_BLOG_POSTS)
    const { id } = await params
    const body = await request.json()
    const updated = await blogService.updateTag(id, body)
    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar tag'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_ALL_BLOG_POSTS)
    const { id } = await params
    await blogService.deleteTag(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar tag'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
