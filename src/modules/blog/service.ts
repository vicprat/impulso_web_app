import { type AuthSession } from '@/modules/auth/service'
import { prisma } from '@/src/lib/prisma'

import {
  type CreateCategoryDto,
  type CreatePostDto,
  type CreateTagDto,
  type PaginatedResult,
  type PostFilters,
  type PostWithRelations,
  type UpdateCategoryDto,
  type UpdatePostDto,
  type UpdateTagDto,
  categoryCreateSchema,
  categoryUpdateSchema,
  postCreateSchema,
  postFiltersSchema,
  postUpdateSchema,
  tagCreateSchema,
  tagUpdateSchema,
} from './types'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function ensureUniqueSlug(
  base: string,
  entity: 'post' | 'category' | 'tag',
  excludeId?: string
) {
  const baseSlug = slugify(base)
  let candidate = baseSlug
  let suffix = 1

  while (true) {
    const where: any = { slug: candidate }
    if (excludeId) where.id = { not: excludeId }
    const exists = await (entity === 'post'
      ? prisma.post.findFirst({ where })
      : entity === 'category'
        ? prisma.category.findFirst({ where })
        : prisma.tag.findFirst({ where }))
    if (!exists) return candidate
    candidate = `${baseSlug}-${suffix++}`
  }
}

function buildPostWhere(filters: PostFilters) {
  const where: any = {}

  if (filters.status) where.status = filters.status
  if (typeof filters.featured === 'boolean') where.featured = filters.featured
  if (filters.authorId) where.authorId = filters.authorId
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: 'insensitive' as const } },
      { slug: { contains: filters.q, mode: 'insensitive' as const } },
      { content: { contains: filters.q, mode: 'insensitive' as const } },
      { excerpt: { contains: filters.q, mode: 'insensitive' as const } },
    ]
  }
  if (filters.categoryId) {
    where.categories = { some: { categoryId: filters.categoryId } }
  }
  if (filters.tagId) {
    where.tags = { some: { tagId: filters.tagId } }
  }

  return where
}

export const blogService = {
  async createCategory(rawData: CreateCategoryDto) {
    const data = categoryCreateSchema.parse(rawData)
    const slug = await ensureUniqueSlug(data.slug ?? data.name, 'category')
    return prisma.category.create({
      data: { ...data, description: data.description ?? null, slug },
    })
  },

  async createPost(rawData: CreatePostDto, session: AuthSession): Promise<PostWithRelations> {
    const data = postCreateSchema.parse(rawData)

    const slug = await ensureUniqueSlug(data.slug ?? data.title, 'post')

    const created = await prisma.post.create({
      data: {
        additionalImages: data.additionalImages ?? [],
        authorId: session.user.id,
        content: data.content,
        excerpt: data.excerpt ?? null,
        featured: data.featured ?? false,
        featuredImageUrl: data.featuredImageUrl ?? null,
        metaDescription: data.metaDescription ?? null,
        metaTitle: data.metaTitle ?? null,
        slug,
        status: data.status ?? 'DRAFT',
        title: data.title,
        ...(data.categoryIds && data.categoryIds.length
          ? {
              categories: {
                createMany: { data: data.categoryIds.map((categoryId) => ({ categoryId })) },
              },
            }
          : {}),
        ...(data.tagIds && data.tagIds.length
          ? { tags: { createMany: { data: data.tagIds.map((tagId) => ({ tagId })) } } }
          : {}),
        ...(data.status === 'PUBLISHED' ? { publishedAt: new Date() } : {}),
      },
      include: {
        author: { select: { email: true, firstName: true, id: true, lastName: true } },
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    })

    return created
  },

  async createTag(rawData: CreateTagDto) {
    const data = tagCreateSchema.parse(rawData)
    const slug = await ensureUniqueSlug(data.slug ?? data.name, 'tag')
    return prisma.tag.create({ data: { ...data, slug } })
  },

  async deleteCategory(id: string) {
    await prisma.category.delete({ where: { id } })
  },

  async deletePost(id: string, session: AuthSession, hasAllPermission: boolean): Promise<void> {
    const existing = await prisma.post.findUnique({ where: { id } })
    if (!existing) return
    if (!hasAllPermission && existing.authorId !== session.user.id) {
      throw new Error('No autorizado')
    }
    await prisma.post.delete({ where: { id } })
  },

  async deleteTag(id: string) {
    await prisma.tag.delete({ where: { id } })
  },

  async getCategoryById(id: string) {
    return prisma.category.findUnique({ where: { id } })
  },

  async getPostById(id: string): Promise<PostWithRelations | null> {
    return prisma.post.findUnique({
      include: {
        author: { select: { email: true, firstName: true, id: true, lastName: true } },
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
      where: { id },
    })
  },

  async getPostBySlug(slug: string): Promise<PostWithRelations | null> {
    return prisma.post.findUnique({
      include: {
        author: { select: { email: true, firstName: true, id: true, lastName: true } },
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
      where: { slug },
    })
  },

  async getTagById(id: string) {
    return prisma.tag.findUnique({ where: { id } })
  },

  // ===== Categorías =====
  async listCategories() {
    return prisma.category.findMany({ orderBy: { order: 'asc' } })
  },

  // ===== Posts =====
  async listPosts(rawFilters: Partial<PostFilters>): Promise<PaginatedResult<PostWithRelations>> {
    const filters = postFiltersSchema.parse(rawFilters)
    const where = buildPostWhere(filters)

    const orderBy: any = (() => {
      switch (filters.sortBy) {
        case 'author':
          return [
            { author: { lastName: filters.sortOrder } },
            { author: { firstName: filters.sortOrder } },
          ]
        case 'categoriesCount':
          return { categories: { _count: filters.sortOrder } }
        default:
          return { [filters.sortBy]: filters.sortOrder }
      }
    })()

    const [total, items] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        include: {
          author: { select: { email: true, firstName: true, id: true, lastName: true } },
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
        orderBy,
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
        where,
      }),
    ])

    const totalPages = Math.ceil(total / filters.pageSize)
    const hasNextPage = filters.page < totalPages
    const hasPreviousPage = filters.page > 1

    return {
      hasNextPage,
      hasPreviousPage,
      items,
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages,
    }
  },

  // ===== Tags =====
  async listTags() {
    return prisma.tag.findMany({ orderBy: { name: 'asc' } })
  },

  async updateCategory(id: string, rawData: UpdateCategoryDto) {
    const data = categoryUpdateSchema.parse(rawData)
    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) throw new Error('Categoría no encontrada')
    const slug = data.slug ? await ensureUniqueSlug(data.slug, 'category', id) : undefined
    return prisma.category.update({ data: { ...data, slug }, where: { id } })
  },

  async updatePost(
    id: string,
    rawData: UpdatePostDto,
    session: AuthSession,
    hasAllPermission: boolean
  ): Promise<PostWithRelations> {
    const data = postUpdateSchema.parse(rawData)

    const existing = await prisma.post.findUnique({ where: { id } })
    if (!existing) throw new Error('Post no encontrado')

    if (!hasAllPermission && existing.authorId !== session.user.id) {
      throw new Error('No autorizado')
    }

    const newSlug = data.slug ? await ensureUniqueSlug(data.slug, 'post', id) : undefined

    const updated = await prisma.post.update({
      data: {
        additionalImages: data.additionalImages,
        content: data.content,
        excerpt: data.excerpt,
        featured: data.featured,
        featuredImageUrl: data.featuredImageUrl,
        metaDescription: data.metaDescription,
        metaTitle: data.metaTitle,
        slug: newSlug,
        status: data.status,
        title: data.title,
        ...(data.status === 'PUBLISHED' && !existing.publishedAt
          ? { publishedAt: new Date() }
          : {}),
        ...(data.categoryIds
          ? {
              categories: {
                createMany: { data: data.categoryIds.map((categoryId) => ({ categoryId })) },
                deleteMany: {},
              },
            }
          : {}),
        ...(data.tagIds
          ? {
              tags: {
                createMany: { data: data.tagIds.map((tagId) => ({ tagId })) },
                deleteMany: {},
              },
            }
          : {}),
      },
      include: {
        author: { select: { email: true, firstName: true, id: true, lastName: true } },
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
      where: { id },
    })

    return updated
  },

  async updateTag(id: string, rawData: UpdateTagDto) {
    const data = tagUpdateSchema.parse(rawData)
    const existing = await prisma.tag.findUnique({ where: { id } })
    if (!existing) throw new Error('Tag no encontrado')
    const slug = data.slug ? await ensureUniqueSlug(data.slug, 'tag', id) : undefined
    return prisma.tag.update({ data: { ...data, slug }, where: { id } })
  },
}
