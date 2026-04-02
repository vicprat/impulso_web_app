import { type RouteConfig } from '@/config/routes'

export type UserRole = 'customer' | 'vip_customer' | 'support' | 'manager' | 'admin'

export type Permission =
  | 'view_profile'
  | 'update_profile'
  | 'view_orders'
  | 'create_orders'
  | 'cancel_orders'
  | 'view_addresses'
  | 'manage_addresses'
  | 'manage_cart'
  | 'access_admin'
  | 'manage_users'
  | 'manage_roles'
  | 'view_all_orders'
  | 'manage_all_orders'
  | 'view_analytics'
  | 'view_products'
  | 'manage_products'
  | 'manage_inventory'
  | 'export_data'
  | 'view_logs'

export type RouteParams = Record<string, string | undefined>

export type RouteQuery = Record<string, string | string[] | undefined>

export type TypedRoute<T extends string = string> = T

export const ROUTES = {
  ADDRESSES: '/addresses' as TypedRoute<'/addresses'>,

  ADMIN: '/admin' as TypedRoute<'/admin'>,

  ADMIN_ANALYTICS: '/admin/analytics' as TypedRoute<'/admin/analytics'>,

  ADMIN_PRODUCTS: '/admin/products' as TypedRoute<'/admin/products'>,

  ADMIN_ROLES: '/admin/roles' as TypedRoute<'/admin/roles'>,

  ADMIN_USERS: '/admin/users' as TypedRoute<'/admin/users'>,

  CART: '/store/cart' as TypedRoute<'/store/cart'>,

  COLLECTION: (handle: string) => `/store/collections/${handle}` as TypedRoute,

  COLLECTIONS: '/store/collections' as TypedRoute<'/store/collections'>,

  DASHBOARD: '/dashboard' as TypedRoute<'/dashboard'>,

  HOME: '/' as TypedRoute<'/'>,

  LOGIN: '/auth/login' as TypedRoute<'/auth/login'>,

  LOGOUT: '/auth/logout' as TypedRoute<'/auth/logout'>,

  ORDERS: '/orders' as TypedRoute<'/orders'>,

  ORDER_DETAIL: (id: string) => `/orders/${id}` as TypedRoute,

  PRODUCT: (handle: string) => `/store/product/${handle}` as TypedRoute,
  PROFILE: '/profile' as TypedRoute<'/profile'>,
  SEARCH: '/store/search' as TypedRoute<'/store/search'>,
  STORE: '/store' as TypedRoute<'/store'>,

  SUPPORT: '/support' as TypedRoute<'/support'>,
  SUPPORT_CUSTOMERS: '/support/customers' as TypedRoute<'/support/customers'>,
  SUPPORT_TICKETS: '/support/tickets' as TypedRoute<'/support/tickets'>,
} as const

export const buildUrl = (route: string, params?: RouteParams, query?: RouteQuery): string => {
  let url = route

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url = url.replace(`:${key}`, value)
      }
    })
  }

  if (query) {
    const searchParams = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, v))
        } else {
          searchParams.append(key, value)
        }
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  return url
}

export interface NavigationSection {
  id: string
  title: string
  routes: RouteConfig[]
  icon?: React.ComponentType<{ className?: string }>
  requiredRoles?: UserRole[]
  requiredPermissions?: Permission[]
}

export interface NavigationContext {
  currentPath: string
  isActive: (path: string) => boolean
  canAccess: (route: RouteConfig) => boolean
  navigateTo: (path: string) => void
}

export interface BreadcrumbItem {
  label: string
  path: string
  isActive?: boolean
  icon?: React.ComponentType<{ className?: string }>
}

export interface RouteMeta {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
  noIndex?: boolean
}

export interface RouteConfigWithMeta extends RouteConfig {
  meta?: RouteMeta
}

export interface UseRoutesReturn {
  storeNavRoutes: RouteConfig[]
  dashboardNavRoutes: RouteConfig[]
  currentRouteMeta: {
    isPublic: boolean
    requiredRoles?: string[]
    requiredPermissions?: string[]
  }
  breadcrumbs: BreadcrumbItem[]
  canAccessRoute: (route: RouteConfig) => boolean
  isCurrentRoutePublic: boolean
  isStorePage: boolean
  isDashboardPage: boolean
}
