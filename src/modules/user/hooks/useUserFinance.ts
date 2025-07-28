import { useQuery } from '@tanstack/react-query'

interface FinancialMetrics {
  totalMovements: number
  pendingAmount: number
  totalIncome: number
  totalExpenses: number
  totalIncomePaid: number // Lo que realmente se ha pagado de ingresos
  totalExpensesPaid: number // Lo que realmente se ha pagado de gastos
  lastMovement: {
    id: string
    amount: number
    description: string
    date: string
    status: string
    category?: string
  } | null
}

interface ArtistInfo {
  id: string
  name: string
  products: {
    id: string
    title: string
    status: string
  }[]
}

interface CustomerInfo {
  id: string
  orderCount: number
  totalSpent: number
  orders: {
    id: string
    totalPrice: number
    createdAt: string
    status: string
  }[]
}

interface UserFinanceData {
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    roles: string[]
  }
  financialMetrics: FinancialMetrics
  artistInfo?: ArtistInfo | null
  customerInfo?: CustomerInfo | null
}

export function useUserFinance(userId: string, role?: string) {
  return useQuery({
    enabled: !!userId && !!role,
    // 5 minutos
gcTime: 10 * 60 * 1000,
    
queryFn: async (): Promise<UserFinanceData> => {
      const params = new URLSearchParams()
      if (role) {
        params.append('role', role)
      }
      
      const response = await fetch(`/api/users/${userId}/finance?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Error al obtener datos financieros del usuario')
      }
      
      return response.json()
    },
    
queryKey: ['user-finance', userId, role], 
    staleTime: 5 * 60 * 1000, // 10 minutos
  })
} 