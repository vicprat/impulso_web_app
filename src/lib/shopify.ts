
import { createStorefrontApiClient } from '@shopify/storefront-api-client';

export const storeClient = createStorefrontApiClient({
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE ?? '',
  apiVersion: process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? '2024-10',
  publicAccessToken: process.env.NEXT_PUBLIC_API_SHOPIFY_STOREFRONT ?? '',
});

export const makeStorefrontRequest = async (query: string, variables?: Record<string, unknown>) => {
  try {
    const response = await storeClient.request(query, {
      variables: variables || {}
    });
    
    if (response.errors) {
      console.error('Storefront API errors:', response.errors);
      throw new Error(
        typeof response.errors === 'string'
          ? response.errors
          : JSON.stringify(response.errors) || 'GraphQL error'
      );
    }
    
    return response.data;
  } catch (error) {
    console.error('Storefront API request failed:', error);
    throw error;
  }
};

export { storeClient as default };