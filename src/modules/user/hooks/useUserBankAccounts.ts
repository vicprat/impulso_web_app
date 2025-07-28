import { useQuery } from '@tanstack/react-query'

interface UserBankAccount {
  id: string
  name: string
  bankName?: string
  currentBalance: number
  movementsCount: number
  lastMovement: {
    id: string
    amount: number
    type: string
    status: string
    date: string
  } | null
}

interface UserBankAccountsData {
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
  bankAccounts: UserBankAccount[]
}

export function useUserBankAccounts(userId: string) {
  return useQuery({
    enabled: !!userId,
    // 5 minutos
gcTime: 10 * 60 * 1000,
    
queryFn: async (): Promise<UserBankAccountsData> => {
      const response = await fetch(`/api/users/${userId}/bank-accounts`)
      
      if (!response.ok) {
        throw new Error('Error al obtener las cuentas bancarias del usuario')
      }
      
      return response.json()
    },
    
queryKey: ['user-bank-accounts', userId], 
    staleTime: 5 * 60 * 1000, // 10 minutos
  })
} 