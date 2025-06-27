/* eslint-disable @typescript-eslint/no-unused-vars */
import { api } from './api';
import { ProductsResponse, ProductSearchParams, Product } from './types';
import { prisma } from '@/lib/prisma';

export const privateRoomsServerApi = {
  getPrivateRoomByUserId: async (userId: string) => {
    try {
      const privateRoom = await prisma.privateRoom.findFirst({
        where: {
          userId: userId,
        },
        include: {
          products: true,
        },
      });

      return privateRoom;
    } catch (error) {
      return null;
    }
  },

  getPrivateProductIds: async (): Promise<string[]> => {
    try {
      const privateRoomProducts = await prisma.privateRoomProduct.findMany({
        select: {
          productId: true,
        },
      });
      return privateRoomProducts.map(p => p.productId);
    } catch (error) {
      return [];
    }
  },
};

export const getPrivateProductIds = async (): Promise<string[]> => {
  try {
    if (typeof window === 'undefined') {
      return await privateRoomsServerApi.getPrivateProductIds();
    } else {
      const response = await fetch('/api/private-rooms/product-ids');
      if (!response.ok) {
        throw new Error(`Error fetching private product IDs: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    }
  } catch (error) {
    return [];
  }
};

export const getPrivateRoomByUserId = async (userId: string) => {
  try {
    if (typeof window === 'undefined') {
      return await privateRoomsServerApi.getPrivateRoomByUserId(userId);
    } else {
      const response = await fetch(`/api/private-rooms/user/${userId}`);
      if (!response.ok) {
        throw new Error(`Error fetching private room: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    }
  } catch (error) {
    return null;
  }
};

export const shopifyService = {
  getPublicProducts: async (params: ProductSearchParams = {}): Promise<ProductsResponse> => {
    const [allProductsResponse, privateProductIds] = await Promise.all([
      api.getProducts(params),
      getPrivateProductIds(),
    ]);

    const filteredProducts = allProductsResponse.data.products.filter(
      (product: Product) => !privateProductIds.includes(product.id)
    );

    return {
      data: {
        products: filteredProducts,
        pageInfo: allProductsResponse.data.pageInfo,
      },
      statusCode: allProductsResponse.statusCode,
    };
  },

  getRelatedProducts: async (product: Product): Promise<Product[]> => {
    const vendorQuery = product.vendor ? `vendor:'${product.vendor}'` : '';
    const priceRangeQuery = product.priceRange ? `priceRange:'${product.priceRange}'` : '';
    const combinedQuery = [vendorQuery, priceRangeQuery].filter(Boolean).join(' OR ');

    const [relatedData, privateProductIds] = await Promise.all([
      api.getProducts({
        first: 20, 
        filters: {
          query: combinedQuery,
        }
      }),
      getPrivateProductIds(),
    ]);

    if (!relatedData.data.products) {
      return [];
    }

    const filtered = relatedData.data.products.filter(p => 
      p.id !== product.id && !privateProductIds.includes(p.id)
    );

    const shuffleArray = (array: Product[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const shuffled = shuffleArray(filtered);
    return shuffled.slice(0, 8);
  },
};