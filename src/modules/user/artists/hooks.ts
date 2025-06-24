import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArtistProduct, PaginatedProductsResponse, GetArtistProductsParams, CreateProductPayload } from './types';
import axios from 'axios';

const ARTIST_PRODUCTS_QUERY_KEY = 'artistProducts';

export const useGetArtistProducts = () => {
  return useQuery<ArtistProduct[]>({
    queryKey: [ARTIST_PRODUCTS_QUERY_KEY],
    queryFn: async () => {
      const { data } = await axios.get('/api/artists/products');
      return data.products || [];
    },
  });
};

export const useGetArtistProductsPaginated = (params: GetArtistProductsParams = {}) => {
  const { page = 1, limit = 10, search = '', cursor } = params;
  
  return useQuery<PaginatedProductsResponse>({
    queryKey: [ARTIST_PRODUCTS_QUERY_KEY, 'paginated', { page, limit, search, cursor }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (page) searchParams.append('page', page.toString());
      if (limit) searchParams.append('limit', limit.toString());
      if (search.trim()) searchParams.append('search', search.trim());
      if (cursor) searchParams.append('cursor', cursor);
      
      const { data } = await axios.get(`/api/artists/products?${searchParams.toString()}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateArtistProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: Partial<ArtistProduct> & { id: string }) => {
            const numericId = payload.id.split('/').pop();
            const { data } = await axios.put(`/api/artists/products/${numericId}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ARTIST_PRODUCTS_QUERY_KEY] });
        }
    });
};

export const useUploadImage = () => {
    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await axios.post('/api/uploads', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        },
    });
};

export const useGetArtistProduct = (productId: string) => {
  return useQuery<ArtistProduct>({
    queryKey: [ARTIST_PRODUCTS_QUERY_KEY, 'single', productId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/artists/products/${productId}`);
      return data;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useDeleteArtistProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/artists/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ARTIST_PRODUCTS_QUERY_KEY] });
    },
  });
};

export const useCreateArtistProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (productData: CreateProductPayload) => {
            const { data } = await axios.post('/api/artists/products', productData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ARTIST_PRODUCTS_QUERY_KEY] });
        }
    });
};