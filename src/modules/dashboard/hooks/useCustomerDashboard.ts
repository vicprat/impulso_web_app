import { useEffect, useState } from 'react'

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

export const useCustomerDashboard = () => {
  const [data, setData] = useState<CustomerDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCustomerDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const query = `
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

        const response = await fetch('/api/customer/graphql', {
          body: JSON.stringify({ query }),
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

        setData(result.data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchCustomerDashboardData()
  }, [])

  return { data, error, isLoading }
}
