export interface RouteConfig {
  path: string
  label: string
  icon?: string
  description?: string
  permissions?: string[]
  roles?: string[]
  children?: RouteConfig[]
  isPublic?: boolean
  hideInNav?: boolean
  badge?: string | number
  isExternal?: boolean
  breadcrumb?: string
}

// Rutas públicas del storefront
export const PublicStoreRoutes: RouteConfig[] = [
  {
    description: 'Página principal de la tienda',
    icon: 'home',
    isPublic: true,
    label: 'Inicio',
    path: '/',
  },
  {
    description: 'Explorar todos los productos',
    icon: 'shopping-bag',
    isPublic: true,
    label: 'Tienda',
    path: '/store',
  },
  {
    description: 'Ver todas las colecciones',
    icon: 'grid',
    isPublic: true,
    label: 'Colecciones',
    path: '/store/collections',
  },
  {
    hideInNav: true,
    icon: 'search',
    isPublic: true,
    label: 'Buscar',
    path: '/store/search',
  },
]

// Rutas de autenticación
export const AuthRoutes: RouteConfig[] = [
  {
    hideInNav: true,
    icon: 'log-in',
    isPublic: true,
    label: 'Iniciar Sesión',
    path: '/auth/login',
  },
  {
    hideInNav: true,
    icon: 'log-out',
    label: 'Cerrar Sesión',
    path: '/auth/logout',
  },
  {
    hideInNav: true,
    isPublic: true,
    label: 'Callback',
    path: '/auth/callback',
  },
]

// Rutas del cliente autenticado
export const CustomerRoutes: RouteConfig[] = [
  {
    description: 'Tu panel de control personal',
    icon: 'layout-dashboard',
    label: 'Panel Principal',
    path: '/dashboard',
    permissions: ['view_profile'],
  },
  {
    description: 'Gestiona tu información personal',
    icon: 'user',
    label: 'Mi Perfil',
    path: '/profile',
    permissions: ['view_profile', 'update_profile'],
  },
  {
    description: 'Historial de pedidos',
    icon: 'package',
    label: 'Mis Pedidos',
    path: '/orders',
    permissions: ['view_orders'],
  },
  {
    breadcrumb: 'Detalle',
    hideInNav: true,
    label: 'Detalle del Pedido',
    path: '/orders/:id',
    permissions: ['view_orders'],
  },
  {
    description: 'Gestiona tus direcciones de envío',
    icon: 'map-pin',
    label: 'Direcciones',
    path: '/addresses',
    permissions: ['view_addresses', 'manage_addresses'],
  },
  {
    badge: 'cartItemCount',
    icon: 'shopping-cart',
    label: 'Carrito',
    path: '/store/cart',
    permissions: ['manage_cart'], // Indicador dinámico
  },
]

// Rutas VIP (clientes con beneficios adicionales)
export const VipRoutes: RouteConfig[] = [
  {
    description: 'Análisis de tus compras',
    icon: 'bar-chart',
    label: 'Mis Estadísticas',
    path: '/analytics',
    permissions: ['view_analytics'],
    roles: ['vip_customer'],
  },
  {
    description: 'Ofertas exclusivas para clientes VIP',
    icon: 'star',
    label: 'Ofertas VIP',
    path: '/vip-offers',
    roles: ['vip_customer'],
  },
]

// Rutas de soporte
export const SupportRoutes: RouteConfig[] = [
  {
    children: [
      {
        icon: 'message-square',
        label: 'Tickets',
        path: '/support/tickets',
        permissions: ['view_all_orders'],
      },
      {
        icon: 'users',
        label: 'Clientes',
        path: '/support/customers',
        permissions: ['view_all_orders'],
      },
      {
        icon: 'activity',
        label: 'Logs de Actividad',
        path: '/support/logs',
        permissions: ['view_logs'],
      },
    ],
    icon: 'headphones',
    label: 'Panel de Soporte',
    path: '/support',
    permissions: ['view_all_orders'],
    roles: ['support', 'manager', 'admin'],
  },
]

// Rutas administrativas
export const AdminRoutes: RouteConfig[] = [
  {
    children: [
      {
        description: 'Gestión de usuarios del sistema',
        icon: 'users',
        label: 'Usuarios',
        path: '/admin/users',
        permissions: ['manage_users'],
      },
      {
        icon: 'shield',
        label: 'Roles y Permisos',
        path: '/admin/roles',
        permissions: ['manage_roles'],
        roles: ['admin'],
      },
      {
        description: 'Gestión del catálogo',
        icon: 'package',
        label: 'Productos',
        path: '/admin/products',
        permissions: ['manage_products'],
      },
      {
        icon: 'archive',
        label: 'Inventario',
        path: '/manage-inventory',
        permissions: ['manage_inventory'],
      },
      {
        icon: 'trending-up',
        label: 'Analíticas',
        path: '/admin/analytics',
        permissions: ['view_analytics'],
        roles: ['manager', 'admin'],
      },
    ],
    icon: 'settings',
    label: 'Administración',
    path: '/admin',
    permissions: ['access_admin'],
    roles: ['manager', 'admin'],
  },
  {
    icon: 'layout-dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    permissions: ['view_dashboard'],
    roles: ['manager', 'admin'],
  },
  {
    icon: 'calendar',
    label: 'Gestionar Eventos',
    path: '/admin/events',
    permissions: ['manage_events'],
    roles: ['manager', 'admin'],
  },
  {
    icon: 'ticket',
    label: 'Gestionar Tickets',
    path: '/manage-tickets',
    permissions: ['manage_tickets'],
    roles: ['manager', 'admin'],
  },
  {
    icon: 'lock',
    label: 'Sala Privada',
    path: '/private-room',
    permissions: ['access_private_room'],
    roles: ['manager', 'admin'],
  },
  {
    icon: 'scan',
    label: 'Escaner',
    path: '/scanner',
    permissions: ['use_scanner'],
    roles: ['manager', 'admin'],
  },
]

// Rutas dinámicas del store (no aparecen en navegación)
export const DynamicStoreRoutes: RouteConfig[] = [
  {
    breadcrumb: 'Producto',
    hideInNav: true,
    isPublic: true,
    label: 'Producto',
    path: '/store/product/:handle',
  },
  {
    breadcrumb: 'Colección',
    hideInNav: true,
    isPublic: true,
    label: 'Colección',
    path: '/store/collections/:handle',
  },
]

// Rutas de error y utilidad
export const UtilityRoutes: RouteConfig[] = [
  {
    hideInNav: true,
    isPublic: true,
    label: 'Página no encontrada',
    path: '/404',
  },
  {
    hideInNav: true,
    isPublic: true,
    label: 'Error del servidor',
    path: '/500',
  },
  {
    hideInNav: true,
    isPublic: true,
    label: 'No autorizado',
    path: '/unauthorized',
  },
]

// Función para obtener todas las rutas públicas
export const getAllPublicRoutes = (): string[] => {
  const publicRoutes = [
    ...PublicStoreRoutes,
    ...AuthRoutes,
    ...DynamicStoreRoutes,
    ...UtilityRoutes,
  ]
    .filter((route) => route.isPublic)
    .map((route) => route.path)

  return publicRoutes
}

// Función para verificar si una ruta es pública
export const isPublicRoute = (path: string): boolean => {
  // Rutas estáticas públicas
  const staticPublic = getAllPublicRoutes().some((route) => {
    if (route.includes(':')) {
      // Manejar rutas dinámicas
      const pattern = route.replace(/:[^/]+/g, '[^/]+')
      const regex = new RegExp(`^${pattern}$`)
      return regex.test(path)
    }
    return route === path || (route !== '/' && path.startsWith(`${route}/`))
  })

  return staticPublic
}

// Función para obtener rutas por rol
export const getRoutesByRole = (userRoles: string[], userPermissions: string[]): RouteConfig[] => {
  const allRoutes = [...CustomerRoutes, ...VipRoutes, ...SupportRoutes, ...AdminRoutes]

  return filterRoutesByAccess(allRoutes, userRoles, userPermissions)
}

// Función para filtrar rutas basadas en roles y permisos
export const filterRoutesByAccess = (
  routes: RouteConfig[],
  userRoles: string[],
  userPermissions: string[]
): RouteConfig[] => {
  return routes
    .filter((route) => {
      // Si no hay restricciones, mostrar
      if (!route.roles && !route.permissions) return true

      // Verificar roles
      const hasRequiredRole = !route.roles || route.roles.some((role) => userRoles.includes(role))

      // Verificar permisos
      const hasRequiredPermission =
        !route.permissions ||
        route.permissions.every((permission) => userPermissions.includes(permission))

      return hasRequiredRole && hasRequiredPermission
    })
    .map((route) => {
      // Filtrar children recursivamente
      if (route.children) {
        return {
          ...route,
          children: filterRoutesByAccess(route.children, userRoles, userPermissions),
        }
      }
      return route
    })
}

// Función para obtener rutas de navegación del store
export const getStoreNavRoutes = (): RouteConfig[] => {
  return PublicStoreRoutes.filter((route) => !route.hideInNav)
}

// Función para obtener rutas del dashboard del usuario
export const getDashboardNavRoutes = (
  userRoles: string[],
  userPermissions: string[]
): RouteConfig[] => {
  const routes = getRoutesByRole(userRoles, userPermissions)
  return routes.filter((route) => !route.hideInNav)
}

// Función para construir breadcrumbs
export const buildBreadcrumbs = (
  pathname: string,
  routes: RouteConfig[]
): { label: string; path: string }[] => {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: { label: string; path: string }[] = []

  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`

    // Buscar la ruta correspondiente
    const route = findRouteByPath(currentPath, routes)
    if (route) {
      breadcrumbs.push({
        label: route.breadcrumb || route.label,
        path: currentPath,
      })
    } else if (segment.match(/^[a-zA-Z0-9-]+$/)) {
      // Es un parámetro dinámico
      const parentPath = segments.slice(0, index).join('/')
      const dynamicRoute = findDynamicRoute(`${parentPath}/:param`, routes)
      if (dynamicRoute) {
        breadcrumbs.push({
          label: dynamicRoute.breadcrumb || segment,
          path: currentPath,
        })
      }
    }
  })

  return breadcrumbs
}

// Función auxiliar para encontrar ruta por path
const findRouteByPath = (path: string, routes: RouteConfig[]): RouteConfig | null => {
  for (const route of routes) {
    if (route.path === path) return route
    if (route.children) {
      const found = findRouteByPath(path, route.children)
      if (found) return found
    }
  }
  return null
}

// Función auxiliar para encontrar rutas dinámicas
const findDynamicRoute = (pattern: string, routes: RouteConfig[]): RouteConfig | null => {
  for (const route of routes) {
    if (route.path.includes(':') && matchDynamicRoute(pattern, route.path)) {
      return route
    }
    if (route.children) {
      const found = findDynamicRoute(pattern, route.children)
      if (found) return found
    }
  }
  return null
}

// Función para hacer match de rutas dinámicas
const matchDynamicRoute = (path: string, pattern: string): boolean => {
  const pathSegments = path.split('/').filter(Boolean)
  const patternSegments = pattern.split('/').filter(Boolean)

  if (pathSegments.length !== patternSegments.length) return false

  return patternSegments.every((segment, index) => {
    return segment.startsWith(':') || segment === pathSegments[index]
  })
}

// Función para obtener meta información de la ruta actual
export const getRouteMeta = (
  pathname: string
): {
  isPublic: boolean
  requiredRoles?: string[]
  requiredPermissions?: string[]
} => {
  const allRoutes = [
    ...PublicStoreRoutes,
    ...AuthRoutes,
    ...CustomerRoutes,
    ...VipRoutes,
    ...SupportRoutes,
    ...AdminRoutes,
    ...DynamicStoreRoutes,
    ...UtilityRoutes,
  ]

  const route = findRouteByPath(pathname, allRoutes) || findDynamicRoute(pathname, allRoutes)

  if (!route) {
    return { isPublic: false }
  }

  return {
    isPublic: route.isPublic || false,
    requiredPermissions: route.permissions,
    requiredRoles: route.roles,
  }
}

export const AppRoutes: RouteConfig[] = [
  ...CustomerRoutes,
  ...VipRoutes,
  ...SupportRoutes,
  ...AdminRoutes,
]
