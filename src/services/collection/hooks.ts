import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'

import type { CreateCollectionInput, UpdateCollectionInput } from './types'

export const COLLECTION_KEYS = {
  all: ['collections'] as const,
  detail: (id: string) => [...COLLECTION_KEYS.details(), id] as const,
  details: () => [...COLLECTION_KEYS.all, 'detail'] as const,
  list: (params: any) => [...COLLECTION_KEYS.lists(), params] as const,
  lists: () => [...COLLECTION_KEYS.all, 'list'] as const,
}

export const useCollections = (
  params: {
    limit?: number
    cursor?: string
    query?: string
  } = {},
  options?: Omit<UseQueryOptions<any, Error, any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    // 5 minutos
    gcTime: 1000 * 60 * 10,

    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params.limit) searchParams.append('limit', params.limit.toString())
      if (params.cursor) searchParams.append('cursor', params.cursor)
      if (params.query) searchParams.append('query', params.query)

      const response = await fetch(`/api/shopify/collections?${searchParams.toString()}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error ?? `HTTP ${response.status}: ${response.statusText}`)
      }
      return response.json()
    },

    queryKey: COLLECTION_KEYS.list(params),

    // 10 minutos
    retry: 2,

    retryDelay: 1000,
    select: (response) => response.data,
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export const useCollection = (
  id: string,
  options?: Omit<UseQueryOptions<any, Error, any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    enabled: !!id,
    queryFn: async () => {
      const encodedId = encodeURIComponent(id)
      const response = await fetch(`/api/shopify/collections/${encodedId}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error ?? `HTTP ${response.status}: ${response.statusText}`)
      }
      return response.json()
    },
    queryKey: COLLECTION_KEYS.detail(id),
    select: (response) => response.data,
    ...options,
  })
}

export const useCreateCollection = (
  options?: UseMutationOptions<any, Error, CreateCollectionInput>
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateCollectionInput) => {
      const response = await fetch('/api/shopify/collections', {
        body: JSON.stringify(input),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error ?? `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: COLLECTION_KEYS.lists() })
    },
    ...options,
  })
}

export const useUpdateCollection = (
  options?: UseMutationOptions<any, Error, UpdateCollectionInput>
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateCollectionInput) => {
      const encodedId = encodeURIComponent(id)
      const response = await fetch(`/api/shopify/collections/${encodedId}`, {
        body: JSON.stringify(input),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error ?? `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: COLLECTION_KEYS.lists() })
      void queryClient.invalidateQueries({ queryKey: COLLECTION_KEYS.detail(variables.id) })
    },
    ...options,
  })
}

export const useDeleteCollection = (options?: UseMutationOptions<any, Error, string>) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const encodedId = encodeURIComponent(id)
      const response = await fetch(`/api/shopify/collections/${encodedId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error ?? `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: COLLECTION_KEYS.lists() })
    },
    ...options,
  })
}

export function useAddProductsToCollection(
  options?: UseMutationOptions<any, Error, { collectionId: string; productIds: string[] }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ collectionId, productIds }) => {
      const encodedId = encodeURIComponent(collectionId)
      const response = await fetch(`/api/shopify/collections/${encodedId}/products`, {
        body: JSON.stringify({ productIds }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error adding products to collection')
      }

      return response.json()
    },
    onSuccess: ({ collectionId }) => {
      void queryClient.invalidateQueries({ queryKey: COLLECTION_KEYS.lists() })
      void queryClient.invalidateQueries({ queryKey: COLLECTION_KEYS.detail(collectionId) })
    },
    ...options,
  })
}

export function useRemoveProductsFromCollection(
  options?: UseMutationOptions<any, Error, { collectionId: string; productIds: string[] }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ collectionId, productIds }) => {
      const encodedId = encodeURIComponent(collectionId)
      const response = await fetch(`/api/shopify/collections/${encodedId}/products`, {
        body: JSON.stringify({ productIds }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error removing products from collection')
      }

      return response.json()
    },
    onSuccess: ({ collectionId }) => {
      void queryClient.invalidateQueries({ queryKey: COLLECTION_KEYS.lists() })
      void queryClient.invalidateQueries({ queryKey: COLLECTION_KEYS.detail(collectionId) })
    },
    ...options,
  })
}
