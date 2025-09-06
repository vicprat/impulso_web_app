import { useQuery } from '@tanstack/react-query'


interface ArtistDashboardData {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  artistProducts: any[]
  artistMetrics: {
    totalProducts: number
    activeProducts: number
    draftProducts: number
    totalValue: number
    averagePrice: number
    productsWithArtworkDetails: number
  }
  artistEvents: any[]
  artistProductsByCategory: Record<string, number>
  artistProductsByMedium: Record<string, number>
  artistProductsByYear: Record<string, number>
  artistProductsByLocation: Record<string, number>
  artistProductsBySerie: Record<string, number>
}

export const useArtistDashboard = () => {
  return useQuery({
    // 5 minutos
gcTime: 10 * 60 * 1000,
    
queryFn: async (): Promise<ArtistDashboardData> => {
      const response = await fetch('/api/dashboard/artist')
      if (!response.ok) {
        throw new Error('Error al obtener datos del dashboard del artista')
      }
      return response.json()
    },
    
queryKey: [ 'artist-dashboard' ], 
    staleTime: 5 * 60 * 1000, // 10 minutos
  })
}
