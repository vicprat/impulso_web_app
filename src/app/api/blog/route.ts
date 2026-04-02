import { NextResponse } from 'next/server'

import { PERMISSIONS } from '@/config/Permissions'
import { requirePermission } from '@/modules/auth/server/server'
import { blogService } from '@/modules/blog/service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const slug = searchParams.get('slug') ?? undefined
    const visibility = searchParams.get('visibility') ?? undefined

    if (slug) {
      const post = await blogService.getPostBySlug(slug)
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
    }

    const rawFilters: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      rawFilters[key] = value
    })

    if (visibility === 'all') {
      const session = await requirePermission([
        PERMISSIONS.MANAGE_ALL_BLOG_POSTS,
        PERMISSIONS.MANAGE_OWN_BLOG_POSTS,
      ])

      try {
        await requirePermission(PERMISSIONS.MANAGE_ALL_BLOG_POSTS)
      } catch {
        rawFilters.authorId = session.user.id
      }
    } else {
      rawFilters.status = 'PUBLISHED'
    }

    const result = await blogService.listPosts(rawFilters)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener posts'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission([
      PERMISSIONS.MANAGE_ALL_BLOG_POSTS,
      PERMISSIONS.MANAGE_OWN_BLOG_POSTS,
    ])

    const body = await request.json()

    const created = await blogService.createPost(body, session)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear post'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
