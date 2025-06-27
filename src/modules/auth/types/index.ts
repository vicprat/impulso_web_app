import { Cart } from "@/modules/cart/types";

export type User = {
  id: string;
  shopifyCustomerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions: string[];
}

export type AuthContextType = {
  user: User | null;
  cart: Cart | null; 
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateCart: (cart: Cart) => void; 
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}


export type AuthMeResponse = {
  user: User;
  expiresAt: string;
  refreshed: boolean;
  cart: Cart | null;
}

export type UseAuthGuardOptions = {
  redirectTo?: string;
  requiredPermission?: string;
  requiredRole?: string;
}

export type CustomerOrder = {
  id: string;
  name: string;
  processedAt: string;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  fulfillmentStatus: string;
  financialStatus: string;
}

export type CustomerAddress= {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone?: string;
}