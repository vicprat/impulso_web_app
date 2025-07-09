import { useEffect, useState } from 'react'

interface Product {
  id: string
  title: string
  vendor: string
  status: string
  price: string
  inventoryQuantity: number
}

interface PaginatedProductsResponse {
  products: Product[]
  pageInfo: {
    hasNextPage: boolean
    endCursor?: string | null
  }
}

interface ArtistDetails {
  id: string
  email: string
  firstName?: string
  lastName?: string
  artist?: {
    name: string
  }
}

export const useArtistProducts = (
  userId: string,
  page = 1,
  limit = 10,
  status?: string,
  sortBy?: string,
  sortOrder?: string
) => {
  const [productsData, setProductsData] = useState<PaginatedProductsResponse | null>(null)
  const [artistDetails, setArtistDetails] = useState<ArtistDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // 1. Fetch artist details
        const userResponse = await fetch(`/api/users/${userId}`)
        if (!userResponse.ok) {
          throw new Error(`Failed to fetch artist details: ${userResponse.statusText}`)
        }
        const userDetails: ArtistDetails = await userResponse.json()
        setArtistDetails(userDetails)

        const artistName = userDetails.artist?.name

        if (!artistName) {
          setError(new Error('Artist name not found for this user.'))
          setIsLoading(false)
          return
        }

        // 2. Fetch products using artist name as vendor with pagination, filtering, and sorting
        const queryParams = new URLSearchParams()
        queryParams.append('vendor', artistName)
        queryParams.append('page', String(page))
        queryParams.append('limit', String(limit))
        if (status) queryParams.append('status', status)
        if (sortBy) queryParams.append('sortBy', sortBy)
        if (sortOrder) queryParams.append('sortOrder', sortOrder)

        const productsResponse = await fetch(`/api/management/products?${queryParams.toString()}`)
        if (!productsResponse.ok) {
          throw new Error(`Failed to fetch artist products: ${productsResponse.statusText}`)
        }
        const products: PaginatedProductsResponse = await productsResponse.json()
        setProductsData(products)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchArtistData()
  }, [userId, page, limit, status, sortBy, sortOrder])

  return { artistDetails, error, isLoading, productsData }
}
