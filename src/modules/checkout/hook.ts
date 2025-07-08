import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from './api'

export const checkoutKeys = {
  all: ['checkout'] as const,
  current: () => [...checkoutKeys.all, 'current'] as const,
}

export function useCreateCheckout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.createCheckout,
    onError: (error) => {
      console.error('Error creating checkout:', error)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: checkoutKeys.current() })
    },
  })
}
