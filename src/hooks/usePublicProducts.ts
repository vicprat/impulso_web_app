'use client'

import { useEffect, useState } from 'react'

import { shopifyService } from '@/modules/shopify/service'
import { type Product } from '@/modules/shopify/types'

export const usePublicProducts = (limit = 10) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await shopifyService.getPublicProducts({
          first: limit,
          reverse: true,
          sortKey: 'CREATED_AT',
        })
        setProducts(response.data.products)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar productos')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [limit])

  return { error, loading, products }
} 