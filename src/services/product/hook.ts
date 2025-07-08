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
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params.search) searchParams.append('search', params.search)
      if (params.cursor) searchParams.append('cursor', params.cursor)
      if (params.limit) searchParams.append('limit', params.limit.toString())

      const { data } = await axios.get(`/api/management/products?${searchParams.toString()}`)
      return data
    },
    queryKey: [PRODUCTS_QUERY_KEY, 'paginated', params],
    staleTime: 5 * 60 * 1000,
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
    onSuccess: (updatedProduct) => {
      const productId = updatedProduct.id.split('/').pop()

      void queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, 'paginated'] })
      void queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, 'infinite'] })

      queryClient.setQueryData([PRODUCTS_QUERY_KEY, 'detail', productId], updatedProduct)

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
      const searchParams = new URLSearchParams()
      if (params.search) searchParams.append('search', params.search)
      searchParams.append('limit', '1000')

      const { data } = await axios.get(`/api/management/products?${searchParams.toString()}`)
      const products: Product[] = data.products ?? []

      return {
        active: products.filter((p) => p.status === 'ACTIVE').length,
        archived: products.filter((p) => p.status === 'ARCHIVED').length,
        draft: products.filter((p) => p.status === 'DRAFT').length,
        inStock: products.filter((p) => p.isAvailable).length,
        outOfStock: products.filter((p) => !p.isAvailable).length,
        total: products.length,
      }
    },
    queryKey: [PRODUCTS_QUERY_KEY, 'stats', params],
    staleTime: 2 * 60 * 1000,
  })
}
