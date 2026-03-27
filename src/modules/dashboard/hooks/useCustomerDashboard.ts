import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/modules/auth/context/useAuth'

interface Order {
  id: string
  name: string
  processedAt: string
  totalPrice: {
    amount: string
    currencyCode: string
  }
}

interface CustomerData {
  id: string
  firstName: string
  lastName: string
  orders: {
    edges: { node: Order }[]
  }
}

interface CustomerDashboardData {
  customer: CustomerData
}

const CUSTOMER_DASHBOARD_QUERY = `
  query CustomerDashboard {
    customer {
      id
      firstName
      lastName
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            processedAt
            totalPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`

const fetchCustomerDashboard = async (): Promise<CustomerDashboardData> => {
  const response = await fetch('/api/customer/graphql', {
    body: JSON.stringify({ query: CUSTOMER_DASHBOARD_QUERY }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  const result = await response.json()

  if (!response.ok || result.errors) {
    const errorMessage = result.errors
      ? result.errors.map((err: any) => err.message).join(', ')
      : response.statusText
    throw new Error(`Failed to fetch customer dashboard data: ${errorMessage}`)
  }

  return result.data
}

export const useCustomerDashboard = () => {
  const { user } = useAuth()

  return useQuery({
    enabled: !!user,
    queryFn: fetchCustomerDashboard,
    queryKey: ['customerDashboard', user?.id],
    refetchInterval: 10 * 60 * 1000, // 10 minutos
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}
