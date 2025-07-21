import { PERMISSIONS } from './Permissions'
import { ROLES } from './Roles'

export interface RouteConfig {
  PATH: string
  LABEL: string
  ICON?: string
  DESCRIPTION?: string
  PERMISSIONS?: readonly string[]
  ROLES?: readonly string[]
  IS_PUBLIC?: boolean
  HIDE_IN_NAV?: boolean
  BADGE?: string | number
  IS_EXTERNAL?: boolean
  BREADCRUMB?: string
}

export const ROUTES = {
  ADMIN: {
    MAIN: {
      ICON: 'settings',
      LABEL: 'Administración',
      PATH: '/admin',
      PERMISSIONS: [PERMISSIONS.ACCESS_ADMIN],
      ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
  },

  AUTH: {
    LOGIN: {
      HIDE_IN_NAV: true,
      ICON: 'log-in',
      IS_PUBLIC: true,
      LABEL: 'Iniciar Sesión',
      PATH: '/auth/login',
    },
  },

  COLLECTIONS: {
    DETAIL: {
      DESCRIPTION: 'Detalle de una colección de productos',
      ICON: 'grid',
      IS_PUBLIC: true,
      LABEL: 'Detalle de la colección',
      PATH: '/store/collections/:collection',
    },
    MAIN: {
      DESCRIPTION: 'Colecciones de productos',
      ICON: 'grid',
      IS_PUBLIC: true,
      LABEL: 'Colecciones',
      PATH: '/store/collections',
    },
  },

  CUSTOMER: {
    DASHBOARD: {
      DESCRIPTION: 'Tu panel de control personal',
      ICON: 'layout-dashboard',
      LABEL: 'Panel Principal',
      PATH: '/dashboard',
      PERMISSIONS: [PERMISSIONS.VIEW_PROFILE],
    },
    PROFILE: {
      DESCRIPTION: 'Gestiona tu información personal',
      ICON: 'user',
      LABEL: 'Mi Perfil',
      PATH: '/profile',
      PERMISSIONS: [PERMISSIONS.VIEW_PROFILE, PERMISSIONS.UPDATE_PROFILE],
      ROLES: [ROLES.ARTIST.NAME, ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
  },

  EVENTS: {
    CREATE: {
      ICON: 'plus',
      LABEL: 'Crear Evento',
      PATH: '/admin/events/create',
      PERMISSIONS: [PERMISSIONS.MANAGE_EVENTS],
      ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
    DETAIL: {
      ICON: 'edit',
      LABEL: 'Editar Evento',
      PATH: '/admin/events/:id',
      PERMISSIONS: [PERMISSIONS.MANAGE_EVENTS],
      ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
    MAIN: {
      DESCRIPTION: 'Gestionar Eventos',
      ICON: 'calendar',
      LABEL: 'Eventos',
      PATH: '/admin/events',
      PERMISSIONS: [PERMISSIONS.MANAGE_EVENTS],
      ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
    MANAGE: {
      ICON: 'edit',
      LABEL: 'Gestionar Evento',
      PATH: '/admin/events/manage/:eventId',
      PERMISSIONS: [PERMISSIONS.MANAGE_EVENTS],
      ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
  },

  INVENTORY: {
    CREATE: {
      ICON: 'plus',
      LABEL: 'Crear Producto',
      PATH: '/manage-inventory/create',
      PERMISSIONS: [PERMISSIONS.MANAGE_INVENTORY, PERMISSIONS.MANAGE_OWN_PRODUCTS],
      ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.ARTIST.NAME],
    },
    DETAIL: {
      ICON: 'edit',
      LABEL: 'Editar Producto',
      PATH: '/manage-inventory/:id',
      PERMISSIONS: [PERMISSIONS.MANAGE_INVENTORY, PERMISSIONS.MANAGE_OWN_PRODUCTS],
      ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.ARTIST.NAME],
    },
    MAIN: {
      ICON: 'archive',
      LABEL: 'Inventario',
      PATH: '/manage-inventory',
      PERMISSIONS: [PERMISSIONS.MANAGE_INVENTORY, PERMISSIONS.MANAGE_OWN_PRODUCTS],
      ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.ARTIST.NAME],
    },
  },

  ORDERS: {
    DETAIL: {
      BREADCRUMB: 'Detalle',
      HIDE_IN_NAV: true,
      LABEL: 'Detalle del Pedido',
      PATH: '/orders/:orderId',
      PERMISSIONS: [PERMISSIONS.VIEW_ORDERS],
    },
    MAIN: {
      DESCRIPTION: 'Historial de pedidos',
      ICON: 'package',
      LABEL: 'Mis Pedidos',
      PATH: '/orders',
      PERMISSIONS: [PERMISSIONS.VIEW_ORDERS],
    },
  },

  PRIVATE_ROOMS: {
    ACCESS: {
      ICON: 'lock',
      LABEL: 'Acceder a Sala Privada',
      PATH: '/private-room',
      PERMISSIONS: [PERMISSIONS.VIEW_PRIVATE_ROOMS],
      ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.VIP_CUSTOMER.NAME],
    },
    CREATE: {
      ICON: 'plus',
      LABEL: 'Crear Sala Privada',
      PATH: '/admin/private-rooms/create',
      PERMISSIONS: [PERMISSIONS.MANAGE_PRIVATE_ROOMS],
      ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
    DETAIL: {
      ICON: 'edit',
      LABEL: 'Editar Sala Privada',
      PATH: '/admin/private-rooms/:id',
      PERMISSIONS: [PERMISSIONS.MANAGE_PRIVATE_ROOMS],
      ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
    MAIN: {
      DESCRIPTION: 'Gestionar Salas Privadas',
      ICON: 'lock',
      LABEL: 'Salas Privadas',
      PATH: '/admin/private-rooms',
      PERMISSIONS: [PERMISSIONS.MANAGE_PRIVATE_ROOMS],
      ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
  },

  PUBLIC: {
    HOME: {
      DESCRIPTION: 'Página principal de la tienda',
      ICON: 'home',
      IS_PUBLIC: true,
      LABEL: 'Inicio',
      PATH: '/',
    },
    PROFILE_DETAIL: {
      DESCRIPTION: 'Perfil Público de un usuario',
      ICON: 'user',
      IS_PUBLIC: true,
      LABEL: 'Perfil Público',
      PATH: '/artists/:userId',
    },
    ARTISTS: {
      DESCRIPTION: 'Lista de artistas públicos',
      ICON: 'users',
      IS_PUBLIC: true,
      LABEL: 'Artistas',
      PATH: '/artists',
    },
  },

  STORE: {
    CART: {
      DESCRIPTION: 'Carrito de compras',
      ICON: 'shopping-cart',
      IS_PUBLIC: true,
      LABEL: 'Carrito',
      PATH: '/store/cart',
    },
    EVENT_DETAIL: {
      DESCRIPTION: 'Detalle del evento',
      ICON: 'calendar',
      IS_PUBLIC: true,
      LABEL: 'Evento',
      PATH: '/store/event/:handle',
    },
    MAIN: {
      DESCRIPTION: 'Explorar todos los productos',
      ICON: 'shopping-bag',
      IS_PUBLIC: true,
      LABEL: 'Galería',
      PATH: '/store',
    },
    PRODUCT_DETAIL: {
      DESCRIPTION: 'Detalle del producto',
      ICON: 'package',
      IS_PUBLIC: true,
      LABEL: 'Producto',
      PATH: '/store/product/:handle',
    },
    SEARCH: {
      DESCRIPTION: 'Búsqueda de productos',
      ICON: 'search',
      IS_PUBLIC: true,
      LABEL: 'Buscar',
      PATH: '/store/search',
    },
  },

  TICKETS: {
    MAIN: {
      ICON: 'ticket',
      LABEL: 'Mis Tickets',
      PATH: '/manage-tickets',
      PERMISSIONS: [PERMISSIONS.VIEW_ACQUIRED_TICKETS],
      ROLES: [
        ROLES.CUSTOMER.NAME,
        ROLES.VIP_CUSTOMER.NAME,
        ROLES.ARTIST.NAME,
        ROLES.SUPPORT.NAME,
        ROLES.MANAGER.NAME,
        ROLES.ADMIN.NAME,
      ],
    },
  },

  USERS: {
    DETAIL: {
      ICON: 'edit',
      LABEL: 'Editar Usuario',
      PATH: '/admin/users/:id',
      PERMISSIONS: [PERMISSIONS.MANAGE_USERS],
      ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
    MAIN: {
      DESCRIPTION: 'Gestionar Usuarios',
      ICON: 'users',
      LABEL: 'Usuarios',
      PATH: '/admin/users',
      PERMISSIONS: [PERMISSIONS.MANAGE_USERS],
      ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
  },

  UTILITY: {
    NOT_FOUND: {
      HIDE_IN_NAV: true,
      IS_PUBLIC: true,
      LABEL: 'Página no encontrada',
      PATH: '/404',
    },
    SERVER_ERROR: {
      HIDE_IN_NAV: true,
      IS_PUBLIC: true,
      LABEL: 'Error del servidor',
      PATH: '/500',
    },
    UNAUTHORIZED: {
      HIDE_IN_NAV: true,
      IS_PUBLIC: true,
      LABEL: 'No autorizado',
      PATH: '/unauthorized',
    },
  },
} as const

export const getAllRoutes = (): RouteConfig[] => {
  const allRoutes: RouteConfig[] = []
  Object.values(ROUTES).forEach((section) => {
    Object.values(section).forEach((route) => {
      allRoutes.push(route)
    })
  })
  return allRoutes
}

export const getAllPublicRoutes = (): string[] => {
  return getAllRoutes()
    .filter((route) => route.IS_PUBLIC)
    .map((route) => route.PATH)
}

export const isPublicRoute = (path: string): boolean => {
  return getAllPublicRoutes().some((routePath) => {
    if (routePath.includes(':')) {
      const pattern = routePath.replace(/:[^/]+/g, '[^/]+')
      const regex = new RegExp(`^${pattern}$`)
      return regex.test(path)
    }
    return path === routePath || (routePath !== '/' && path.startsWith(`${routePath}/`))
  })
}

export const filterRoutesByAccess = (
  routes: RouteConfig[],
  userRoles: string[],
  userPermissions: string[]
): RouteConfig[] => {
  return routes.filter((route) => {
    const hasRequiredRole = !route.ROLES || route.ROLES.some((role) => userRoles.includes(role))
    const hasRequiredPermissions =
      !route.PERMISSIONS ||
      route.PERMISSIONS.some((permission) => userPermissions.includes(permission))

    return hasRequiredRole && hasRequiredPermissions
  })
}

export const getDashboardNavRoutes = (
  userRoles: string[],
  userPermissions: string[]
): RouteConfig[] => {
  const navigationRoutes = [
    ...Object.values(ROUTES.CUSTOMER),
    ROUTES.ORDERS.MAIN,
    ...Object.values(ROUTES.ADMIN),
    ROUTES.EVENTS.MAIN,
    ROUTES.USERS.MAIN,
    ROUTES.PRIVATE_ROOMS.ACCESS,
    ROUTES.INVENTORY.MAIN,
    ROUTES.TICKETS.MAIN,
  ]

  return filterRoutesByAccess(navigationRoutes, userRoles, userPermissions).filter(
    (route) => !route.HIDE_IN_NAV
  )
}

export const getStoreNavRoutes = (): RouteConfig[] => {
  const publicStoreRoutes = [ROUTES.PUBLIC.HOME, ROUTES.STORE.MAIN, ROUTES.COLLECTIONS.MAIN, ROUTES.PUBLIC.ARTISTS]

  return publicStoreRoutes.filter((route) => 'HIDE_IN_NAV' in route && !route.HIDE_IN_NAV)
}

export const getSectionRoutes = (
  sectionName: keyof typeof ROUTES,
  userRoles: string[],
  userPermissions: string[]
): RouteConfig[] => {
  const sectionRoutes = Object.values(ROUTES[sectionName])
  return filterRoutesByAccess(sectionRoutes, userRoles, userPermissions)
}

export const getRouteMeta = (
  pathname: string
): {
  isPublic: boolean
  requiredRoles?: readonly string[]
  requiredPermissions?: readonly string[]
} => {
  const route = getAllRoutes().find((route) => {
    if (route.PATH.includes(':')) {
      const pattern = route.PATH.replace(/:[^/]+/g, '[^/]+')
      const regex = new RegExp(`^${pattern}$`)
      return regex.test(pathname)
    }
    return route.PATH === pathname
  })

  if (!route) return { isPublic: false }

  return {
    isPublic: route.IS_PUBLIC ?? false,
    requiredPermissions: route.PERMISSIONS,
    requiredRoles: route.ROLES,
  }
}

export const generateSectionBreadcrumbs = (
  pathname: string,
  sectionName: string
): { label: string; path: string }[] => {
  const breadcrumbs: { label: string; path: string }[] = []

  breadcrumbs.push({ label: 'Inicio', path: '/' })
  breadcrumbs.push({ label: sectionName, path: '/admin' })

  const route = getAllRoutes().find((r) => {
    if (r.PATH.includes(':')) {
      const pattern = r.PATH.replace(/:[^/]+/g, '[^/]+')
      const regex = new RegExp(`^${pattern}$`)
      return regex.test(pathname)
    }
    return r.PATH === pathname
  })

  if (route && route.PATH !== '/admin') {
    breadcrumbs.push({
      label: route.BREADCRUMB ?? route.LABEL,
      path: pathname,
    })
  }

  return breadcrumbs
}

export const buildBreadcrumbs = (
  pathname: string,
  routes: RouteConfig[]
): { label: string; path: string }[] => {
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs: { label: string; path: string }[] = []

  let currentPath = ''
  for (const segment of pathSegments) {
    currentPath += `/${segment}`
    const route = routes.find((r) => {
      if (r.PATH.includes(':')) {
        const pattern = r.PATH.replace(/:[^/]+/g, '[^/]+')
        const regex = new RegExp(`^${pattern}$`)
        return regex.test(currentPath)
      }
      return r.PATH === currentPath
    })

    if (route) {
      breadcrumbs.push({
        label: route.BREADCRUMB ?? route.LABEL,
        path: currentPath,
      })
    }
  }

  return breadcrumbs
}

export const COMMON_ROUTE_PATTERNS = {
  DYNAMIC_COLLECTION: ':collection',
  DYNAMIC_EVENT_ID: ':eventId',
  DYNAMIC_HANDLE: ':handle',
  DYNAMIC_ID: ':id',
  DYNAMIC_ORDER_ID: ':orderId',
  DYNAMIC_USER_ID: ':userId',
} as const

export const replaceRouteParams = (
  routePath: string,
  params: Record<string, string | number>
): string => {
  let path = routePath
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, String(value))
  })
  return path
}

export const getRoutesByPermission = (permission: string): RouteConfig[] => {
  return getAllRoutes().filter((route) => route.PERMISSIONS?.includes(permission))
}

export const getRoutesByRole = (role: string): RouteConfig[] => {
  return getAllRoutes().filter((route) => route.ROLES?.includes(role))
}
