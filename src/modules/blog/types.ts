import { z } from 'zod'

import type { Category, Post, PostStatus, Prisma, Tag } from '@prisma/client'

export type PostWithRelations = Prisma.PostGetPayload<{
  include: {
    author: { select: { id: true; firstName: true; lastName: true; email: true } }
    categories: { include: { category: true } }
    tags: { include: { tag: true } }
  }
}>

export type CategoryWithRelations = Prisma.CategoryGetPayload<{
  include: { posts: true }
}>

export type TagWithRelations = Prisma.TagGetPayload<{
  include: { posts: true }
}>

export const idSchema = z.string().min(1, 'ID requerido')
export const slugSchema = z
  .string()
  .min(1, 'Slug requerido')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido')

const urlSchema = z.string().url('URL inválida')

export const postCreateSchema = z.object({
  additionalImages: z.array(urlSchema).optional().default([]),
  categoryIds: z.array(idSchema).optional().default([]),
  content: z.string().min(1, 'El contenido es requerido'),
  date: z
    .union([z.string(), z.date()])
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null
      if (val instanceof Date) return val
      return new Date(val)
    }),
  excerpt: z.string().max(600).optional().nullable(),
  featured: z.boolean().optional(),
  featuredImageUrl: urlSchema.optional().nullable(),
  location: z.string().optional().nullable(),
  metaDescription: z.string().max(300).optional().nullable(),
  metaTitle: z.string().max(120).optional().nullable(),
  postType: z.enum(['BLOG', 'EVENT']).optional().default('BLOG'),
  slug: z.string().optional(),
  status: z
    .enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'] satisfies [PostStatus, PostStatus, PostStatus])
    .optional(),
  tagIds: z.array(idSchema).optional().default([]),
  title: z.string().min(3, 'El título es muy corto'),
})

export const postUpdateSchema = z
  .object({
    additionalImages: z.array(urlSchema).optional(),
    categoryIds: z.array(idSchema).optional(),
    content: z.string().min(1).optional(),
    date: z
      .union([z.string(), z.date()])
      .optional()
      .nullable()
      .transform((val) => {
        if (!val) return null
        if (val instanceof Date) return val
        return new Date(val)
      }),
    excerpt: z.string().max(600).optional().nullable(),
    featured: z.boolean().optional(),
    featuredImageUrl: urlSchema.optional().nullable(),
    location: z.string().optional().nullable(),
    metaDescription: z.string().max(300).optional().nullable(),
    metaTitle: z.string().max(120).optional().nullable(),
    postType: z.enum(['BLOG', 'EVENT']).optional(),
    slug: z.string().optional(),
    status: z
      .enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'] satisfies [PostStatus, PostStatus, PostStatus])
      .optional(),
    tagIds: z.array(idSchema).optional(),
    title: z.string().min(3).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Se requiere al menos un campo para actualizar',
  })

export type CreatePostDto = z.infer<typeof postCreateSchema>
export type UpdatePostDto = z.infer<typeof postUpdateSchema>

export const categoryCreateSchema = z.object({
  color: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  name: z.string().min(2),
  order: z.number().int().min(0).optional(),
  slug: z.string().optional(),
})

export const categoryUpdateSchema = z
  .object({
    color: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    name: z.string().min(2).optional(),
    order: z.number().int().min(0).optional(),
    slug: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Se requiere al menos un campo para actualizar',
  })

export type CreateCategoryDto = z.infer<typeof categoryCreateSchema>
export type UpdateCategoryDto = z.infer<typeof categoryUpdateSchema>

export const tagCreateSchema = z.object({
  color: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  name: z.string().min(2),
  slug: z.string().optional(),
})

export const tagUpdateSchema = z
  .object({
    color: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    name: z.string().min(2).optional(),
    slug: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Se requiere al menos un campo para actualizar',
  })

export type CreateTagDto = z.infer<typeof tagCreateSchema>
export type UpdateTagDto = z.infer<typeof tagUpdateSchema>

export const PostSortFieldEnum = z.enum([
  'publishedAt',
  'createdAt',
  'updatedAt',
  'title',
  'author',
  'categoriesCount',
])
export type PostSortField = z.infer<typeof PostSortFieldEnum>

export const postFiltersSchema = z.object({
  authorId: idSchema.optional(),
  categoryId: idSchema.optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  postType: z.enum(['BLOG', 'EVENT']).optional(),
  q: z.string().optional(),
  sortBy: PostSortFieldEnum.default('publishedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z
    .enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'] satisfies [PostStatus, PostStatus, PostStatus])
    .optional(),
  tagId: idSchema.optional(),
})

export type PostFilters = z.infer<typeof postFiltersSchema>

export interface PaginatedResult<TItem> {
  items: TItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type { Category, Post, PostStatus, Tag }
