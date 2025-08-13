import { NextResponse } from 'next/server'

import { PERMISSIONS } from '@/config/Permissions'
import { requirePermission } from '@/modules/auth/server/server'
import { blogService } from '@/modules/blog/service'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const post = await blogService.getPostById(id)
    if (!post) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    if (!post.publishedAt) {
      try {
        await requirePermission([
          PERMISSIONS.MANAGE_ALL_BLOG_POSTS,
          PERMISSIONS.MANAGE_OWN_BLOG_POSTS,
        ])
      } catch {
        return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      }
    }
    return NextResponse.json(post)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener post'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await requirePermission([
      PERMISSIONS.MANAGE_ALL_BLOG_POSTS,
      PERMISSIONS.MANAGE_OWN_BLOG_POSTS,
    ])

    const body = await request.json()

    let hasAllPermission = false
    try {
      await requirePermission(PERMISSIONS.MANAGE_ALL_BLOG_POSTS)
      hasAllPermission = true
    } catch {
      hasAllPermission = false
    }

    const updated = await blogService.updatePost(id, body, session, hasAllPermission)
    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar post'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await requirePermission([
      PERMISSIONS.MANAGE_ALL_BLOG_POSTS,
      PERMISSIONS.MANAGE_OWN_BLOG_POSTS,
    ])

    let hasAllPermission = false
    try {
      await requirePermission(PERMISSIONS.MANAGE_ALL_BLOG_POSTS)
      hasAllPermission = true
    } catch {
      hasAllPermission = false
    }

    await blogService.deletePost(id, session, hasAllPermission)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar post'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
