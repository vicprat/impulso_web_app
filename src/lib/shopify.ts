import { createStorefrontApiClient } from '@shopify/storefront-api-client'

export const storeClient = createStorefrontApiClient({
  apiVersion: process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? '2024-10',
  publicAccessToken: process.env.NEXT_PUBLIC_API_SHOPIFY_STOREFRONT ?? '',
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE ?? '',
})

export const makeStorefrontRequest = async (query: string, variables?: Record<string, unknown>) => {
  try {
    const response = await storeClient.request(query, {
      variables: variables ?? {},
    })

    if (response.errors) {
      console.error('Storefront API errors:', JSON.stringify(response.errors, null, 2))
      throw new Error(
        typeof response.errors === 'string'
          ? response.errors
          : JSON.stringify(response.errors) || 'GraphQL error'
      )
    }

    return response.data
  } catch (error) {
    console.error('Storefront API request failed:', error)
    throw error
  }
}

export { storeClient as default }

export const makeCustomerRequest = async (query: string, variables?: Record<string, unknown>) => {
  try {
    const response = await fetch('/api/customer/graphql', {
      body: JSON.stringify({ query, variables: variables ?? {} }),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const body = await response.json()

    if (body.errors) {
      console.error('Customer API GraphQL errors:', body.errors)
      throw new Error(typeof body.errors === 'string' ? body.errors : JSON.stringify(body.errors))
    }

    if (!response.ok) {
      const errorMessage = body.error ?? `Request failed with status ${response.status}`
      console.error('Customer API request failed:', errorMessage, body.details ?? '')
      throw new Error(errorMessage)
    }

    return body.data
  } catch (error) {
    console.error('Customer API request failed:', error)
    throw error
  }
}
