import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

import { type Product } from '@/models/Product'
import {
  type CreateProductPayload,
  type GetProductsParams,
  type PaginatedProductsResponse,
  type UpdateProductPayload,
} from '@/services/product/types'

const PRODUCTS_QUERY_KEY = 'managementProducts'

export const useGetProductsPaginated = (params: GetProductsParams = {}) => {
  return useQuery<PaginatedProductsResponse>({
    gcTime: 5 * 60 * 1000, // Reducido de 10 a 5 minutos
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params.search) searchParams.append('search', params.search)
      if (params.cursor) searchParams.append('cursor', params.cursor)
      if (params.limit) searchParams.append('limit', params.limit.toString())
      if (params.sortBy) searchParams.append('sortBy', params.sortBy)
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)

      const { data } = await axios.get(`/api/management/products?${searchParams.toString()}`)
      return data
    },
    queryKey: [PRODUCTS_QUERY_KEY, 'paginated', params],
    staleTime: 2 * 60 * 1000, // Reducido de 5 a 2 minutos para que se considere obsoleto más rápido
  })
}

export const useGetProduct = (productId: string | null) => {
  return useQuery<Product>({
    enabled: !!productId,
    queryFn: async () => {
      if (!productId) throw new Error('Product ID is required')

      const { data } = await axios.get(`/api/management/products/${productId}`)
      return data
    },
    queryKey: [PRODUCTS_QUERY_KEY, 'detail', productId],
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateProductPayload): Promise<Product> => {
      const { data } = await axios.post('/api/management/products', payload)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] })
    },
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateProductPayload): Promise<Product> => {
      const productId = payload.id.split('/').pop()
      if (!productId) throw new Error('Invalid Product ID for update')

      const { data } = await axios.put(`/api/management/products/${productId}`, payload)
      return data
    },
    onSuccess: (updatedProduct, variables) => {
      const productId = updatedProduct.id.split('/').pop()

      // Invalidar todas las consultas relacionadas con productos
      void queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, 'paginated'] })
      void queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, 'infinite'] })
      void queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, 'stats'] })

      // Si se agregaron imágenes, invalidar completamente el cache del producto
      if (variables.images && variables.images.length > 0) {
        void queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, 'detail', productId] })
      } else if (variables.imagesToDelete && variables.imagesToDelete.length > 0) {
        // Si se eliminaron imágenes, también invalidar el cache
        void queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, 'detail', productId] })
      } else {
        // Actualizar el producto específico en el caché solo si no se modificaron imágenes
        queryClient.setQueryData([PRODUCTS_QUERY_KEY, 'detail', productId], updatedProduct)
      }

      // Actualizar el producto en las listas paginadas
      queryClient.setQueriesData(
        { queryKey: [PRODUCTS_QUERY_KEY, 'paginated'] },
        (oldData: PaginatedProductsResponse | undefined) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            products: oldData.products.map((product) =>
              product.id === updatedProduct.id ? updatedProduct : product
            ),
          }
        }
      )

      // Solo invalidar stats si cambió algo que realmente afecte las estadísticas
      // como el status del producto o la cantidad de inventario
      const oldProduct = queryClient.getQueryData([PRODUCTS_QUERY_KEY, 'detail', productId])
      if (oldProduct) {
        const oldStatus = (oldProduct as Product).status
        const oldInventoryQuantity = (oldProduct as Product).variants[0]?.inventoryQuantity ?? 0
        const newInventoryQuantity = updatedProduct.variants[0]?.inventoryQuantity ?? 0
        
        if (oldStatus !== updatedProduct.status || oldInventoryQuantity !== newInventoryQuantity) {
          void queryClient.invalidateQueries({ queryKey: ['productStats'] })
        }
      }
    },
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (productId: string) => {
      const numericId = productId.split('/').pop()
      if (!numericId) throw new Error('Invalid Product ID for deletion')

      const { data } = await axios.delete(`/api/management/products/${numericId}`)
      return data
    },
    onSuccess: (_, deletedProductId) => {
      const numericId = deletedProductId.split('/').pop()

      void queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, 'paginated'] })
      void queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, 'infinite'] })

      queryClient.removeQueries({ queryKey: [PRODUCTS_QUERY_KEY, 'detail', numericId] })
    },
  })
}

export const useProductStats = (params: Omit<GetProductsParams, 'cursor' | 'limit'> = {}) => {
  return useQuery({
    queryFn: async () => {
      try {
        const searchParams = new URLSearchParams()
        if (params.search) searchParams.append('search', params.search)
        
        const { data } = await axios.get(`/api/management/products/stats?${searchParams.toString()}`, {
          timeout: 60000,
        })
        
        return data
      } catch (error) {
        console.error('Error fetching product stats:', error)
        return {
          active: 0,
          archived: 0,
          draft: 0,
          inStock: 0,
          outOfStock: 0,
          total: 0,
        }
      }
    },
    queryKey: [PRODUCTS_QUERY_KEY, 'stats', params],
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 2 * 60 * 1000,
  })
}

export const useGetVendors = () => {
  return useQuery({
    queryFn: async () => {
      const response = await fetch('/api/vendors')
      if (!response.ok) {
        throw new Error('Error al obtener vendors')
      }
      return response.json() as Promise<string[]>
    },
    queryKey: ['vendors'],
  })
}

export const useGetTechniques = () => {
  return useQuery({
    queryFn: async () => {
      const { data } = await axios.get('/api/options/techniques')
      return data
    },
    queryKey: ['techniques'],
    // 10 minutos
retry: 1, 
    staleTime: 10 * 60 * 1000,
  })
}

export const useGetArtworkTypes = () => {
  return useQuery({
    queryFn: async () => {
      const { data } = await axios.get('/api/options/artwork_types')
      return data
    },
    queryKey: ['artwork_types'],
    // 10 minutos
retry: 1, 
    staleTime: 10 * 60 * 1000,
  })
}

export const useGetLocations = () => {
  return useQuery({
    queryFn: async () => {
      const { data } = await axios.get('/api/options/locations')
      return data
    },
    queryKey: ['locations'],
    // 10 minutos
retry: 1, 
    staleTime: 10 * 60 * 1000,
  })
}

export const useGetCurrentUser = () => {
  return useQuery({
    queryFn: async () => {
      const { data } = await axios.get('/api/auth/me')
      return data
    },
    queryKey: ['currentUser'],
    // 5 minutos
retry: 1, 
    staleTime: 5 * 60 * 1000,
  })
}