export interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  statusCode: number
}

export interface AuthConfig {
  shopId: string
  clientId: string
  clientSecret?: string
  redirectUri: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  id_token: string
  expires_in: number
}

export interface CustomerInfo {
  id: string
  email: string
  firstName?: string
  lastName?: string
}
