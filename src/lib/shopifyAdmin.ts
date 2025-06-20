import { createAdminApiClient } from '@shopify/admin-api-client';

const adminClient = createAdminApiClient({
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE!,
  apiVersion: process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION!,
  accessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!,
});


export const makeAdminApiRequest = async <T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> => {
  try {
    const { data, errors } = await adminClient.request<T>(query, {
      variables: variables || {},
    });

    if (errors) {
      console.error('Shopify Admin API Errors:', errors);
      throw new Error(
        typeof errors === 'string'
          ? errors
          : JSON.stringify(errors) || 'GraphQL error'
      );
    }

    
    return data!;
  } catch (error) {
    console.error('Shopify Admin API request failed:', error);
    throw error;
  }
};
