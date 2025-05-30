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