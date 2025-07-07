import crypto from 'crypto'

import { type AuthConfig, type CustomerInfo, type TokenResponse } from '@/src/types'

export async function generateCodeVerifier(): Promise<string> {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return base64UrlEncode(String.fromCharCode.apply(null, Array.from(array)))
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(digest)))
}

function base64UrlEncode(str: string): string {
  const base64 = btoa(str)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function generateState(): string {
  const timestamp = Date.now().toString()
  const randomString = Math.random().toString(36).substring(2)
  return timestamp + randomString
}

export function generateNonce(length = 32): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let nonce = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    nonce += characters.charAt(randomIndex)
  }

  return nonce
}

export function buildAuthorizationUrl(
  config: AuthConfig,
  codeChallenge: string,
  state: string,
  nonce: string
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    nonce,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid email customer-account-api:full',
    state,
  })

  return `https://shopify.com/authentication/${config.shopId}/oauth/authorize?${params.toString()}`
}

export async function exchangeCodeForTokens(
  config: AuthConfig,
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  const tokenUrl = `https://shopify.com/authentication/${config.shopId}/oauth/token`

  const body = new URLSearchParams({
    client_id: config.clientId,
    code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    redirect_uri: config.redirectUri,
  })

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'content-type': 'application/x-www-form-urlencoded',
  }

  if (config.clientSecret) {
    const credentials = btoa(`${config.clientId}:${config.clientSecret}`)
    headers['Authorization'] = `Basic ${credentials}`
  }

  const response = await fetch(tokenUrl, {
    body: body.toString(),
    headers,
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status}`)
  }

  const responseText = await response.text()

  let tokens
  try {
    tokens = JSON.parse(responseText)
  } catch {
    throw new Error(`Invalid JSON response from token endpoint: ${responseText}`)
  }

  if (!tokens.access_token) {
    throw new Error('No access token received from Shopify')
  }

  return tokens
}

export async function refreshAccessToken(
  config: AuthConfig,
  refreshToken: string
): Promise<Omit<TokenResponse, 'id_token'>> {
  const body = new URLSearchParams({
    client_id: config.clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const headers: Record<string, string> = {
    'content-type': 'application/x-www-form-urlencoded',
  }

  if (config.clientSecret) {
    const credentials = btoa(`${config.clientId}:${config.clientSecret}`)
    headers['Authorization'] = `Basic ${credentials}`
  }

  const response = await fetch(`https://shopify.com/authentication/${config.shopId}/oauth/token`, {
    body,
    headers,
    method: 'POST',
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Token refresh failed: ${response.status} ${errorText}`)
  }

  return response.json()
}

export function decodeJwt(token: string) {
  const [header, payload, signature] = token.split('.')

  const decodedHeader = JSON.parse(atob(header))
  const decodedPayload = JSON.parse(atob(payload))

  return {
    header: decodedHeader,
    payload: decodedPayload,
    signature,
  }
}

export function getNonceFromIdToken(idToken: string): string | null {
  try {
    const decoded = decodeJwt(idToken)
    return decoded.payload.nonce ?? null
  } catch (error) {
    console.error('Error decoding ID token:', error)
    return null
  }
}

export async function getCustomerInfo(
  config: AuthConfig,
  accessToken: string
): Promise<CustomerInfo> {
  if (!accessToken) {
    throw new Error('Access token is required')
  }

  const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? '2025-04'
  const url = `https://shopify.com/${config.shopId}/account/customer/api/${apiVersion}/graphql`

  const query = `
    query {
      customer {
        id
        emailAddress {
          emailAddress
        }
        firstName
        lastName
      }
    }
  `

  const headers = {
    Accept: 'application/json',
    Authorization: accessToken,
    'Content-Type': 'application/json',
  }

  const response = await fetch(url, {
    body: JSON.stringify({ query }),
    headers,
    method: 'POST',
  })

  const responseText = await response.text()

  if (!response.ok) {
    throw new Error(`Failed to fetch customer info: ${response.status} - ${responseText}`)
  }

  let result
  try {
    result = JSON.parse(responseText)
  } catch {
    throw new Error(`Invalid JSON response from customer API: ${responseText}`)
  }

  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
  }

  if (!result.data?.customer) {
    throw new Error('No customer data returned from API')
  }

  const customer = result.data.customer

  if (!customer.id) {
    throw new Error('Customer data is incomplete - missing ID')
  }

  const email = customer.emailAddress?.emailAddress
  if (!email) {
    throw new Error('Customer data is incomplete - missing email')
  }

  const customerInfo = {
    email,
    firstName: customer.firstName ?? '',
    id: customer.id,
    lastName: customer.lastName ?? '',
  }

  return customerInfo
}

export function buildLogoutUrl(
  config: AuthConfig,
  idToken: string,
  postLogoutRedirectUri: string
): string {
  const params = new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: postLogoutRedirectUri,
  })

  return `https://shopify.com/authentication/${config.shopId}/logout?${params.toString()}`
}

export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() >= expiresAt
}

export function calculateExpiresAt(expiresIn: number): Date {
  return new Date(Date.now() + expiresIn * 1000)
}
