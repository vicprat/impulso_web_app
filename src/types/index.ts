export type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export type ApiResponse<T> = {
  data: T;
  message?: string;
  statusCode: number;
};

export type AuthConfig = {
  shopId: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
}

export type TokenResponse  = {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
}

export type CustomerInfo = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}
