import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/useAuth';
import { api } from './api';
import { 
  ShopifyCustomerProfile, 
  CustomerOrder,
  CustomerUpdateInput,
  CustomerAddressInput,
  CustomerBasicInfo,
  CustomerOrdersResult,
  CustomerAddressesResult
} from './types';
import { handleGraphQLErrors } from '@/lib/graphql';

export const customerKeys = {
  all: ['customer'] as const,
  profile: () => [...customerKeys.all, 'profile'] as const,
  basicInfo: () => [...customerKeys.all, 'basicInfo'] as const,
  addresses: (first?: number) => [...customerKeys.all, 'addresses', first] as const,
  orders: (params?: { first?: number; after?: string }) => 
    [...customerKeys.all, 'orders', params] as const,
  order: (id: string) => [...customerKeys.all, 'order', id] as const,
};

export function useCustomerProfile(
  options?: Omit<UseQueryOptions<{ data: { customer: ShopifyCustomerProfile } }, Error>, 'queryKey' | 'queryFn'>
) {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: customerKeys.profile(),
    queryFn: api.getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useCustomerBasicInfo(
  options?: Omit<UseQueryOptions<{ data: { customer: CustomerBasicInfo } }, Error>, 'queryKey' | 'queryFn'>
) {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: customerKeys.basicInfo(),
    queryFn: api.getBasicInfo,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CustomerUpdateInput) => api.updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.profile() });
      queryClient.invalidateQueries({ queryKey: customerKeys.basicInfo() });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
    }
  });
}
export function useCustomerAddresses(
  first: number = 10,
  options?: Omit<UseQueryOptions<{ data: CustomerAddressesResult }, Error>, 'queryKey' | 'queryFn'>
) {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: customerKeys.addresses(first),
    queryFn: () => api.getAddresses(first),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useCreateCustomerAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (address: CustomerAddressInput) => api.createAddress(address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
    },
    onError: (error) => {
      console.error('Error creating address:', error);
    }
  });
}

export function useUpdateCustomerAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ addressId, address }: { addressId: string; address: CustomerAddressInput }) =>
      api.updateAddress(addressId, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
    },
  });
}

export function useDeleteCustomerAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (addressId: string) => api.deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (addressId: string) => api.setDefaultAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.profile() });
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
    },
  });
}

export function useCustomerOrders(
  params?: { first?: number; after?: string },
  options?: Omit<UseQueryOptions<{ data: CustomerOrdersResult }, Error>, 'queryKey' | 'queryFn'>
) {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: customerKeys.orders(params),
    queryFn: () => api.getOrders(params),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useCustomerOrder(
  orderId: string,
  options?: Omit<UseQueryOptions<{ data: CustomerOrder }, Error>, 'queryKey' | 'queryFn'>
) {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: customerKeys.order(orderId),
    queryFn: () => api.getOrder(orderId),
    enabled: isAuthenticated && !!orderId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useCustomerAccount() {
  const { isAuthenticated } = useAuth();
  
  // Queries
  const profileQuery = useCustomerProfile();
  const addressesQuery = useCustomerAddresses();
  const ordersQuery = useCustomerOrders({ first: 10 });
  
  // Mutations
  const updateProfileMutation = useUpdateCustomerProfile();
  const createAddressMutation = useCreateCustomerAddress();
  const updateAddressMutation = useUpdateCustomerAddress();
  const deleteAddressMutation = useDeleteCustomerAddress();
  const setDefaultAddressMutation = useSetDefaultAddress();
  
  // Estados combinados
  const isLoading = profileQuery.isLoading || addressesQuery.isLoading || ordersQuery.isLoading;
  const error = profileQuery.error || addressesQuery.error || ordersQuery.error;
  
  // Funciones wrapper para mantener la API existente
  const getProfile = () => profileQuery.refetch().then(res => res.data?.data);
  const getAddresses = () => addressesQuery.refetch().then(res => res.data?.data);
  const getOrders = () => ordersQuery.refetch().then(res => res.data?.data);
  const getOrder = async (orderId: string) => {
    const result = await api.getOrder(orderId);
    return result.data;
  };
  
  const updateProfile = async (input: CustomerUpdateInput) => {
    const result = await updateProfileMutation.mutateAsync(input);
    return result.data;
  };
  
  const updateShopifyProfile = updateProfile; 
  
  const createAddress = async (address: CustomerAddressInput) => {
    const result = await createAddressMutation.mutateAsync(address);
    return result.data;
  };
  
  const updateAddress = async (addressId: string, address: CustomerAddressInput) => {
    const result = await updateAddressMutation.mutateAsync({ addressId, address });
    return result.data;
  };
  
  const deleteAddress = async (addressId: string) => {
    const result = await deleteAddressMutation.mutateAsync(addressId);
    return result.data;
  };
  
  const setDefaultAddress = async (addressId: string) => {
    const result = await setDefaultAddressMutation.mutateAsync(addressId);
    return result.data;
  };
  
  const getBasicInfo = async () => {
    const result = await api.getBasicInfo();
    return result.data.customer;
  };
  
  const fetchCustomerData = async (query: string, variables?: Record<string, unknown>) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch('/api/customer/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ query, variables: variables || {} }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch customer data: ${errorText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      handleGraphQLErrors(data.errors);
    }

    return data.data;
  };
  
  return {
    // Estados
    isLoading,
    error,
    
    // Datos
    profile: profileQuery.data?.data?.customer,
    addresses: addressesQuery.data?.data?.customer?.addresses?.edges?.map(edge => edge.node) || [],
    orders: ordersQuery.data?.data?.customer?.orders?.edges?.map(edge => edge.node) || [],
    
    // Funciones
    getProfile,
    getAddresses,
    getOrders,
    getOrder,
    updateProfile,
    updateShopifyProfile,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getBasicInfo,
    fetchCustomerData,
    
    // Estados de mutaciones
    isUpdatingProfile: updateProfileMutation.isPending,
    isCreatingAddress: createAddressMutation.isPending,
    isUpdatingAddress: updateAddressMutation.isPending,
    isDeletingAddress: deleteAddressMutation.isPending,
    isSettingDefault: setDefaultAddressMutation.isPending,
  };
}