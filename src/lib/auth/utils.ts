import { AuthConfig, CustomerInfo, TokenResponse } from '@/types';
import crypto from 'crypto';


export async function generateCodeVerifier(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(String.fromCharCode.apply(null, Array.from(array)));
}

// Generar código challenge desde el verifier
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(digest)));
}

// Codificación base64url (sin padding)
function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Generar state para prevenir CSRF
export function generateState(): string {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2);
  return timestamp + randomString;
}

// Generar nonce para prevenir ataques de replay
export function generateNonce(length: number = 32): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    nonce += characters.charAt(randomIndex);
  }
  
  return nonce;
}

// Construir URL de autorización
export function buildAuthorizationUrl(config: AuthConfig, codeChallenge: string, state: string, nonce: string): string {
  const params = new URLSearchParams({
    scope: 'openid email customer-account-api:full',
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    state: state,
    nonce: nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  return `https://shopify.com/authentication/${config.shopId}/oauth/authorize?${params.toString()}`;
}

// Intercambiar código por tokens
export async function exchangeCodeForTokens(
  config: AuthConfig,
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  try {
    console.log('🔄 === INICIANDO INTERCAMBIO DE TOKENS ===');
    console.log('🔧 Configuración:', {
      shopId: config.shopId,
      clientId: config.clientId,
      clientSecret: config.clientSecret ? '✅ Presente' : '❌ Faltante',
      redirectUri: config.redirectUri
    });

    console.log('📋 Parámetros:', {
      code: code.substring(0, 20) + '...',
      codeVerifier: codeVerifier.substring(0, 10) + '...'
    });

    // ✅ URL CORRECTA según documentación oficial de Shopify
    const tokenUrl = `https://shopify.com/authentication/${config.shopId}/oauth/token`;
    console.log('🌐 Token URL:', tokenUrl);

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      code: code,
      code_verifier: codeVerifier
    });

    const headers: Record<string, string> = {
      'content-type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    };

    // Solo agregar Authorization header si es cliente confidencial
    if (config.clientSecret) {
      const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
      headers['Authorization'] = `Basic ${credentials}`;
      console.log('🔐 Using Basic Auth con client secret');
    } else {
      console.log('⚠️ No client secret - usando flujo público');
    }

    console.log('📡 Enviando request a token endpoint...');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers,
      body: body.toString(),
    });

    console.log('📡 Token response status:', response.status);

    if (!response.ok) {
      console.error('❌ Token exchange failed with status:', response.status);
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('📝 Raw token response:', responseText);

    let tokens;
    try {
      tokens = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse token response as JSON:', parseError);
      console.error('📝 Response was:', responseText);
      throw new Error(`Invalid JSON response from token endpoint: ${responseText}`);
    }

    console.log('✅ Tokens recibidos:', {
      access_token: tokens.access_token ? `${tokens.access_token.substring(0, 20)}...` : 'MISSING',
      refresh_token: tokens.refresh_token ? `${tokens.refresh_token.substring(0, 20)}...` : 'MISSING',
      id_token: tokens.id_token ? `${tokens.id_token.substring(0, 20)}...` : 'MISSING',
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
      scope: tokens.scope
    });

    if (!tokens.access_token) {
      console.error('❌ No access token in response!');
      throw new Error('No access token received from Shopify');
    }

    console.log('✅ === INTERCAMBIO DE TOKENS EXITOSO ===');
    return tokens;

  } catch (error) {
    console.error('❌ === ERROR EN INTERCAMBIO DE TOKENS ===');
    console.error('Error details:', error);
    throw error;
  }
}

// Renovar tokens
export async function refreshAccessToken(
  config: AuthConfig,
  refreshToken: string
): Promise<Omit<TokenResponse, 'id_token'>> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: config.clientId,
    refresh_token: refreshToken
  });

  const headers: Record<string, string> = {
    'content-type': 'application/x-www-form-urlencoded',
  };

  if (config.clientSecret) {
    const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
    headers['Authorization'] = `Basic ${credentials}`;
  }

  const response = await fetch(`https://shopify.com/authentication/${config.shopId}/oauth/token`, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

// Decodificar JWT (sin verificación, solo para leer claims)
export function decodeJwt(token: string) {
  const [header, payload, signature] = token.split('.');
  
  const decodedHeader = JSON.parse(atob(header));
  const decodedPayload = JSON.parse(atob(payload));

  return {
    header: decodedHeader,
    payload: decodedPayload,
    signature,
  };
}

// Obtener nonce del id_token
export function getNonceFromIdToken(idToken: string): string | null {
  try {
    const decoded = decodeJwt(idToken);
    return decoded.payload.nonce || null;
  } catch (error) {
    console.error('Error decoding ID token:', error);
    return null;
  }
}

// Obtener información del customer desde el access token


export async function getCustomerInfo(config: AuthConfig, accessToken: string): Promise<CustomerInfo> {
  try {
    console.log('🔍 === OBTENIENDO INFORMACIÓN DEL CLIENTE ===');
    console.log('🔧 Config:', {
      shopId: config.shopId,
      accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'MISSING'
    });

    if (!accessToken) {
      throw new Error('Access token is required');
    }

    // ✅ URL CORRECTA según documentación oficial de Shopify
    // Usar la versión API configurada en las variables de entorno
    const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? '2025-04';
    const url = `https://shopify.com/${config.shopId}/account/customer/api/${apiVersion}/graphql`;
    console.log('📍 Customer Account API URL:', url);

    // ✅ Query GraphQL corregida según documentación oficial
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
    `;

    console.log('📝 GraphQL Query:', query);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': accessToken,
      'Accept': 'application/json',
    };

    console.log('📋 Request headers:', {
      'Content-Type': headers['Content-Type'],
      'Authorization': `${accessToken.substring(0, 20)}...`,
      'Accept': headers['Accept']
    });

    console.log('📡 Enviando request a Customer Account API...');

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    });

    console.log('📡 Customer API response status:', response.status);
    console.log('📡 Customer API response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📝 Raw customer API response:', responseText);

    if (!response.ok) {
      console.error('❌ Customer API error response:', responseText);
      console.error('❌ Request details:', {
        url,
        method: 'POST',
        headers,
        body: JSON.stringify({ query })
      });
      throw new Error(`Failed to fetch customer info: ${response.status} - ${responseText}`);
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse customer response as JSON:', parseError);
      console.error('📝 Response was:', responseText);
      throw new Error(`Invalid JSON response from customer API: ${responseText}`);
    }

    console.log('✅ Parsed customer API response:', result);

    if (result.errors) {
      console.error('❌ GraphQL Errors:', result.errors);
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    if (!result.data?.customer) {
      console.error('❌ No customer data in response');
      console.error('📊 Full response structure:', result);
      throw new Error('No customer data returned from API');
    }

    const customer = result.data.customer;
    console.log('✅ Customer info encontrada:', customer);

    // Validar que tenemos los campos requeridos
    if (!customer.id) {
      console.error('❌ Missing required customer ID');
      console.error('📊 Customer object:', customer);
      throw new Error('Customer data is incomplete - missing ID');
    }

    // ✅ Extraer email desde emailAddress.emailAddress según la documentación
    const email = customer.emailAddress?.emailAddress;
    if (!email) {
      console.error('❌ Missing required customer email');
      console.error('📊 Customer object:', customer);
      throw new Error('Customer data is incomplete - missing email');
    }

    const customerInfo = {
      id: customer.id,
      email: email, // ← Campo extraído de emailAddress.emailAddress
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
    };

    console.log('✅ === INFORMACIÓN DEL CLIENTE OBTENIDA EXITOSAMENTE ===');
    console.log('📊 Customer info final:', customerInfo);

    return customerInfo;

  } catch (error) {
    console.error('❌ === ERROR EN OBTENCIÓN DE INFORMACIÓN DEL CLIENTE ===');
    console.error('Error details:', error);
    throw error;
  }
}
// Construir URL de logout
export function buildLogoutUrl(config: AuthConfig, idToken: string, postLogoutRedirectUri: string): string {
  const params = new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: postLogoutRedirectUri
  });

  return `https://shopify.com/authentication/${config.shopId}/logout?${params.toString()}`;
}

// Validar token expirado
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() >= expiresAt;
}

// Calcular fecha de expiración
export function calculateExpiresAt(expiresIn: number): Date {
  return new Date(Date.now() + (expiresIn * 1000));
}