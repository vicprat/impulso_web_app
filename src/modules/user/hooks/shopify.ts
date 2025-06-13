import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/useAuth';
import { api } from '../../customer/api';
import { CustomerAddress } from '../../customer/types';

export const shopifyKeys = {
  all: ['shopify', 'customer'] as const,
  profile: () => [...shopifyKeys.all, 'profile'] as const,
  basicInfo: () => [...shopifyKeys.all, 'basicInfo'] as const,
  addresses: (first?: number) => [...shopifyKeys.all, 'addresses', first] as const,
  orders: (params?: { first?: number; after?: string }) => 
    [...shopifyKeys.all, 'orders', params] as const,
  order: (id: string) => [...shopifyKeys.all, 'order', id] as const,
};

export function useShopifyProfile() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: shopifyKeys.profile(),
    queryFn: api.getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useShopifyBasicInfo() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: shopifyKeys.basicInfo(),
    queryFn: api.getBasicInfo,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, 
  });
}

export function useUpdateShopifyProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopifyKeys.profile() });
      queryClient.invalidateQueries({ queryKey: shopifyKeys.basicInfo() });
    },
    onError: (error) => {
      if (error.message.includes('userErrors')) {
        console.error('Shopify validation errors:', error);
      }
    }
  });
}

export function useShopifyAddresses(first: number = 10) {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: shopifyKeys.addresses(first),
    queryFn: () => api.getAddresses(first),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateShopifyAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopifyKeys.addresses() });
    },
    onError: (error) => {
      console.error('Error creating address:', error);
    }
  });
}

export function useUpdateShopifyAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ addressId, address }: { addressId: string; address: CustomerAddress }) =>
      api.updateAddress(addressId, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopifyKeys.addresses() });
    },
  });
}

export function useDeleteShopifyAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopifyKeys.addresses() });
    },
  });
}

export function useShopifyOrders(params?: { first?: number; after?: string }) {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: shopifyKeys.orders(params),
    queryFn: () => api.getOrders(params),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, 
  });
}

export function useShopifyOrder(orderId: string) {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: shopifyKeys.order(orderId),
    queryFn: () => api.getOrder(orderId),
    enabled: isAuthenticated && !!orderId,
    staleTime: 2 * 60 * 1000,
  });
}
