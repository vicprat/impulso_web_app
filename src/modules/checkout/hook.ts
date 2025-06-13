import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export const checkoutKeys = {
  all: ['checkout'] as const,
  current: () => [...checkoutKeys.all, 'current'] as const,
};

export function useCreateCheckout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createCheckout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkoutKeys.current() });
    },
    onError: (error) => {
      console.error('Error creating checkout:', error);
    },
  });
}
