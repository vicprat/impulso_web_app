import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { Product } from '@/models/Product';
import {
    PaginatedProductsResponse,
    GetProductsParams,
    CreateProductPayload,
    UpdateProductPayload
} from '@/services/product/types';
import axios from 'axios';

const PRODUCTS_QUERY_KEY = 'managementProducts';

export const useGetProductsPaginated = (params: GetProductsParams = {}) => {
    return useQuery<PaginatedProductsResponse>({
        queryKey: [PRODUCTS_QUERY_KEY, 'paginated', params],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params.search) searchParams.append('search', params.search);
            if (params.cursor) searchParams.append('cursor', params.cursor);
            if (params.limit) searchParams.append('limit', params.limit.toString());
            
            const { data } = await axios.get(`/api/management/products?${searchParams.toString()}`);
            return data;
        },
        staleTime: 5 * 60 * 1000, 
        gcTime: 10 * 60 * 1000, 
    });
};

export const useGetProductsInfinite = (params: Omit<GetProductsParams, 'cursor'> = {}) => {
    return useInfiniteQuery<PaginatedProductsResponse>({
        queryKey: [PRODUCTS_QUERY_KEY, 'infinite', params],
        queryFn: async ({ pageParam }) => {
            const searchParams = new URLSearchParams();
            if (params.search) searchParams.append('search', params.search);
            if (params.limit) searchParams.append('limit', params.limit.toString());
            if (pageParam) searchParams.append('cursor', pageParam as string);
            
            const { data } = await axios.get(`/api/management/products?${searchParams.toString()}`);
            return data;
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.endCursor : undefined,
        staleTime: 5 * 60 * 1000,
    });
};

export const useGetProduct = (productId: string | null) => {
    return useQuery<Product>({
        queryKey: [PRODUCTS_QUERY_KEY, 'detail', productId],
        queryFn: async () => {
            if (!productId) throw new Error("Product ID is required");
            
            const { data } = await axios.get(`/api/management/products/${productId}`);
            return data;
        },
        enabled: !!productId, 
        staleTime: 5 * 60 * 1000,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateProductPayload): Promise<Product> => {
            const { data } = await axios.post('/api/management/products', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: UpdateProductPayload): Promise<Product> => {
            const productId = payload.id.split('/').pop();
            if (!productId) throw new Error("Invalid Product ID for update");
            
            const { data } = await axios.put(`/api/management/products/${productId}`, payload);
            return data;
        },
        onSuccess: (updatedProduct) => {
            const productId = updatedProduct.id.split('/').pop();
            
            queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, 'paginated'] });
            queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, 'infinite'] });
            
            queryClient.setQueryData([PRODUCTS_QUERY_KEY, 'detail', productId], updatedProduct);
            
            queryClient.setQueriesData(
                { queryKey: [PRODUCTS_QUERY_KEY, 'paginated'] },
                (oldData: PaginatedProductsResponse | undefined) => {
                    if (!oldData) return oldData;
                    
                    return {
                        ...oldData,
                        products: oldData.products.map(product => 
                            product.id === updatedProduct.id ? updatedProduct : product
                        ),
                    };
                }
            );
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (productId: string) => {
            const numericId = productId.split('/').pop();
            if (!numericId) throw new Error("Invalid Product ID for deletion");

            const { data } = await axios.delete(`/api/management/products/${numericId}`);
            return data;
        },
        onSuccess: (_, deletedProductId) => {
            const numericId = deletedProductId.split('/').pop();
            
            queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, 'paginated'] });
            queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, 'infinite'] });
            
            queryClient.removeQueries({ queryKey: [PRODUCTS_QUERY_KEY, 'detail', numericId] });
        },
    });
};
export const useProductStats = (params: Omit<GetProductsParams, 'cursor' | 'limit'> = {}) => {
    return useQuery({
        queryKey: [PRODUCTS_QUERY_KEY, 'stats', params],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params.search) searchParams.append('search', params.search);
            searchParams.append('limit', '1000'); 
            
            const { data } = await axios.get(`/api/management/products?${searchParams.toString()}`);
            const products: Product[] = data.products || [];
            
            return {
                total: products.length,
                active: products.filter(p => p.status === 'ACTIVE').length,
                draft: products.filter(p => p.status === 'DRAFT').length,
                archived: products.filter(p => p.status === 'ARCHIVED').length,
                outOfStock: products.filter(p => !p.isAvailable).length,
                inStock: products.filter(p => p.isAvailable).length,
            };
        },
        staleTime: 2 * 60 * 1000, 
    });
};