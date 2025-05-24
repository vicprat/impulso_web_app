import { createStorefrontApiClient } from '@shopify/storefront-api-client';

export const storeClient = createStorefrontApiClient({
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE ?? '',
  apiVersion: process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? '2024-04',
  publicAccessToken: process.env.NEXT_PUBLIC_API_SHOPIFY_STOREFRONT,
});