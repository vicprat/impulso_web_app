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
import type { ApiResponse } from '@/src/types'

const API_BASE = '/api/blog'

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

function buildQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    searchParams.set(key, String(value))
  })
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

export const blogApi = {
  categories: {
    async create(data: CreateCategoryDto): Promise<Category> {
      const res = await fetch(`${API_BASE}/category`, {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      return handleApiResponse(res)
    },
    async getById(id: string): Promise<Category> {
      const res = await fetch(`${API_BASE}/category/${id}`, { method: 'GET' })
      return handleApiResponse(res)
    },
    async list(): Promise<Category[]> {
      const res = await fetch(`${API_BASE}/category`, { method: 'GET' })
      return handleApiResponse(res)
    },
    async remove(id: string): Promise<ApiResponse<{ ok: true }>> {
      const res = await fetch(`${API_BASE}/category/${id}`, { method: 'DELETE' })
      return handleApiResponse(res)
    },
    async update(id: string, data: UpdateCategoryDto): Promise<Category> {
      const res = await fetch(`${API_BASE}/category/${id}`, {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      })
      return handleApiResponse(res)
    },
  },
  posts: {
    async create(data: CreatePostDto): Promise<PostWithRelations> {
      const res = await fetch(API_BASE, {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      return handleApiResponse(res)
    },
    async getById(id: string): Promise<PostWithRelations> {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'GET' })
      return handleApiResponse(res)
    },
    async getBySlug(slug: string): Promise<PostWithRelations> {
      const res = await fetch(`${API_BASE}?slug=${encodeURIComponent(slug)}`, { method: 'GET' })
      return handleApiResponse(res)
    },
    async list(filters: Partial<PostFilters> = {}): Promise<PaginatedResult<PostWithRelations>> {
      const qs = buildQueryParams(filters as Record<string, any>)
      const res = await fetch(`${API_BASE}${qs}`, { method: 'GET' })
      return handleApiResponse(res)
    },
    async listAll(filters: Partial<PostFilters> = {}): Promise<PaginatedResult<PostWithRelations>> {
      const qs = buildQueryParams({ ...filters, visibility: 'all' } as Record<string, any>)
      const res = await fetch(`${API_BASE}${qs}`, { method: 'GET' })
      return handleApiResponse(res)
    },
    async remove(id: string): Promise<ApiResponse<{ ok: true }>> {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
      return handleApiResponse(res)
    },
    async update(id: string, data: Partial<UpdatePostDto>): Promise<PostWithRelations> {
      const res = await fetch(`${API_BASE}/${id}`, {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      })
      return handleApiResponse(res)
    },
  },
  tags: {
    async create(data: CreateTagDto): Promise<Tag> {
      const res = await fetch(`${API_BASE}/tag`, {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      return handleApiResponse(res)
    },
    async getById(id: string): Promise<Tag> {
      const res = await fetch(`${API_BASE}/tag/${id}`, { method: 'GET' })
      return handleApiResponse(res)
    },
    async list(): Promise<Tag[]> {
      const res = await fetch(`${API_BASE}/tag`, { method: 'GET' })
      return handleApiResponse(res)
    },
    async remove(id: string): Promise<ApiResponse<{ ok: true }>> {
      const res = await fetch(`${API_BASE}/tag/${id}`, { method: 'DELETE' })
      return handleApiResponse(res)
    },
    async update(id: string, data: UpdateTagDto): Promise<Tag> {
      const res = await fetch(`${API_BASE}/tag/${id}`, {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      })
      return handleApiResponse(res)
    },
  },
}

export type { PostWithRelations }
