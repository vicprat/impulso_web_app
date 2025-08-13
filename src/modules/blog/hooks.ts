import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { blogApi } from './api'

import type {
  Category,
  CreateCategoryDto,
  CreatePostDto,
  CreateTagDto,
  PaginatedResult,
  PostFilters,
  PostWithRelations,
  Tag,
  UpdateCategoryDto,
  UpdatePostDto,
  UpdateTagDto,
} from './types'

export const BLOG_KEYS = {
  all: ['blog'] as const,
  categories: () => [...BLOG_KEYS.all, 'categories'] as const,
  post: (id: string) => [...BLOG_KEYS.all, 'post', id] as const,
  postBySlug: (slug: string) => [...BLOG_KEYS.all, 'post', 'slug', slug] as const,
  posts: (filters?: Partial<PostFilters>) => [...BLOG_KEYS.all, 'posts', filters ?? {}] as const,
  tags: () => [...BLOG_KEYS.all, 'tags'] as const,
}

// ===== Queries =====
export function usePosts(filters: Partial<PostFilters> = {}) {
  return useQuery<PaginatedResult<PostWithRelations>>({
    queryFn: () => blogApi.posts.list(filters),
    queryKey: BLOG_KEYS.posts(filters),
  })
}

export function useAdminPosts(filters: Partial<PostFilters> = {}) {
  return useQuery<PaginatedResult<PostWithRelations>>({
    queryFn: () => blogApi.posts.listAll(filters),
    queryKey: [...BLOG_KEYS.posts(filters), 'all'],
  })
}

export function usePost(id: string) {
  return useQuery<PostWithRelations>({
    enabled: !!id,
    queryFn: () => blogApi.posts.getById(id),
    queryKey: BLOG_KEYS.post(id),
  })
}

export function usePostBySlug(slug: string) {
  return useQuery<PostWithRelations>({
    enabled: !!slug,
    queryFn: () => blogApi.posts.getBySlug(slug),
    queryKey: BLOG_KEYS.postBySlug(slug),
  })
}

export function useCategories() {
  return useQuery<Category[]>({
    queryFn: () => blogApi.categories.list(),
    queryKey: BLOG_KEYS.categories(),
  })
}

export function useTags() {
  return useQuery<Tag[]>({
    queryFn: () => blogApi.tags.list(),
    queryKey: BLOG_KEYS.tags(),
  })
}

// ===== Mutations =====
export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePostDto) => blogApi.posts.create(data),
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error al crear el post'
      toast.error(message)
    },
    onSuccess: () => {
      toast.success('Post creado exitosamente')
      void qc.invalidateQueries({ queryKey: BLOG_KEYS.posts() })
    },
  })
}

export function useUpdatePost(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdatePostDto) => blogApi.posts.update(id, data),
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error al actualizar el post'
      toast.error(message)
    },
    onSuccess: (updated) => {
      toast.success('Post actualizado')
      void qc.invalidateQueries({ queryKey: BLOG_KEYS.post(id) })
      void qc.invalidateQueries({ queryKey: BLOG_KEYS.posts() })
      if (updated.slug) {
        void qc.invalidateQueries({ queryKey: BLOG_KEYS.postBySlug(updated.slug) })
      }
    },
  })
}

export function useDeletePost(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => blogApi.posts.remove(id),
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error al eliminar el post'
      toast.error(message)
    },
    onSuccess: () => {
      toast.success('Post eliminado')
      void qc.invalidateQueries({ queryKey: BLOG_KEYS.posts() })
    },
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => blogApi.categories.create(data),
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error al crear categoría'
      toast.error(message)
    },
    onSuccess: () => {
      toast.success('Categoría creada')
      void qc.invalidateQueries({ queryKey: BLOG_KEYS.categories() })
    },
  })
}

export function useUpdateCategory(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateCategoryDto) => blogApi.categories.update(id, data),
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error al actualizar categoría'
      toast.error(message)
    },
    onSuccess: () => {
      toast.success('Categoría actualizada')
      void qc.invalidateQueries({ queryKey: BLOG_KEYS.categories() })
    },
  })
}

export function useDeleteCategory(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => blogApi.categories.remove(id),
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error al eliminar categoría'
      toast.error(message)
    },
    onSuccess: () => {
      toast.success('Categoría eliminada')
      void qc.invalidateQueries({ queryKey: BLOG_KEYS.categories() })
    },
  })
}

export function useCreateTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTagDto) => blogApi.tags.create(data),
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error al crear tag'
      toast.error(message)
    },
    onSuccess: () => {
      toast.success('Tag creado')
      void qc.invalidateQueries({ queryKey: BLOG_KEYS.tags() })
    },
  })
}

export function useUpdateTag(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTagDto) => blogApi.tags.update(id, data),
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error al actualizar tag'
      toast.error(message)
    },
    onSuccess: () => {
      toast.success('Tag actualizado')
      void qc.invalidateQueries({ queryKey: BLOG_KEYS.tags() })
    },
  })
}

export function useDeleteTag(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => blogApi.tags.remove(id),
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error al eliminar tag'
      toast.error(message)
    },
    onSuccess: () => {
      toast.success('Tag eliminado')
      void qc.invalidateQueries({ queryKey: BLOG_KEYS.tags() })
    },
  })
}
