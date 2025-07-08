import { PERMISSIONS } from './Permissions'
import { ROLES } from './Roles'

export interface RouteConfig {
  path: string
  label: string
  icon?: string
  description?: string
  permissions?: readonly string[]
  roles?: readonly string[]
  isPublic?: boolean
  hideInNav?: boolean
  badge?: string | number
  isExternal?: boolean
  breadcrumb?: string
}

export const ROUTES = {
  ADMIN: {
    MAIN: {
      icon: 'settings',
      label: 'Administración',
      path: '/admin',
      permissions: [PERMISSIONS.ACCESS_ADMIN],
      roles: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
  },

  AUTH: {
    LOGIN: {
      hideInNav: true,
      icon: 'log-in',
      isPublic: true,
      label: 'Iniciar Sesión',
      path: '/auth/login',
    },
  },

  COLLECTIONS: {
    DETAIL: {
      description: 'Detalle de una colección de productos',
      icon: 'grid',
      isPublic: true,
      label: 'Detalle de la colección',
      path: '/store/collections/:collection',
    },
    MAIN: {
      description: 'Colecciones de productos',
      icon: 'grid',
      isPublic: true,
      label: 'Colecciones',
      path: '/store/collections',
    },
  },

  CUSTOMER: {
    DASHBOARD: {
      description: 'Tu panel de control personal',
      icon: 'layout-dashboard',
      label: 'Panel Principal',
      path: '/dashboard',
      permissions: [PERMISSIONS.VIEW_PROFILE],
    },
    PROFILE: {
      description: 'Gestiona tu información personal',
      icon: 'user',
      label: 'Mi Perfil',
      path: '/profile',
      permissions: [PERMISSIONS.VIEW_PROFILE, PERMISSIONS.UPDATE_PROFILE],
    },
  },

  EVENTOS: {
    CREATE: {
      icon: 'plus',
      label: 'Crear Evento',
      path: '/admin/events/create',
      permissions: [PERMISSIONS.MANAGE_EVENTS],
      roles: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
    DETAIL: {
      icon: 'edit',
      label: 'Editar Evento',
      path: '/admin/events/:id',
      permissions: [PERMISSIONS.MANAGE_EVENTS],
      roles: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
    MAIN: {
      description: 'Gestionar Eventos',
      icon: 'calendar',
      label: 'Eventos',
      path: '/admin/events',
      permissions: [PERMISSIONS.MANAGE_EVENTS],
      roles: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
    MANAGE: {
      icon: 'edit',
      label: 'Gestionar Evento',
      path: '/admin/events/manage/:eventId',
      permissions: [PERMISSIONS.MANAGE_EVENTS],
      roles: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
  },

  INVENTARIO: {
    CREATE: {
      icon: 'plus',
      label: 'Crear Producto',
      path: '/manage-inventory/create',
      permissions: [PERMISSIONS.MANAGE_INVENTORY],
      roles: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.ARTIST.NAME],
    },
    DETAIL: {
      icon: 'edit',
      label: 'Editar Producto',
      path: '/manage-inventory/:id',
      permissions: [PERMISSIONS.MANAGE_INVENTORY],
      roles: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.ARTIST.NAME],
    },
    MAIN: {
      icon: 'archive',
      label: 'Inventario',
      path: '/manage-inventory',
      permissions: [PERMISSIONS.MANAGE_INVENTORY],
      roles: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.ARTIST.NAME],
    },
  },

  ORDERS: {
    DETAIL: {
      breadcrumb: 'Detalle',
      hideInNav: true,
      label: 'Detalle del Pedido',
      path: '/orders/:orderId',
      permissions: [PERMISSIONS.VIEW_ORDERS],
    },
    MAIN: {
      description: 'Historial de pedidos',
      icon: 'package',
      label: 'Mis Pedidos',
      path: '/orders',
      permissions: [PERMISSIONS.VIEW_ORDERS],
    },
  },

  PUBLIC: {
    HOME: {
      description: 'Página principal de la tienda',
      icon: 'home',
      isPublic: true,
      label: 'Inicio',
      path: '/',
    },
    PROFILE_DETAIL: {
      description: 'Perfil Público de un usuario',
      icon: 'user',
      isPublic: true,
      label: 'Perfil Público',
      path: '/profile/:userId',
    },
  },

  SALAS_PRIVADAS: {
    ACCESS: {
      icon: 'lock',
      label: 'Acceder a Sala Privada',
      path: '/private-room',
      permissions: [PERMISSIONS.VIEW_PRIVATE_ROOMS],
      roles: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
    CREATE: {
      icon: 'plus',
      label: 'Crear Sala Privada',
      path: '/admin/private-rooms/create',
      permissions: [PERMISSIONS.MANAGE_PRIVATE_ROOMS],
      roles: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
    DETAIL: {
      icon: 'edit',
      label: 'Editar Sala Privada',
      path: '/admin/private-rooms/:id',
      permissions: [PERMISSIONS.MANAGE_PRIVATE_ROOMS],
      roles: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
    MAIN: {
      description: 'Gestionar Salas Privadas',
      icon: 'lock',
      label: 'Salas Privadas',
      path: '/admin/private-rooms',
      permissions: [PERMISSIONS.MANAGE_PRIVATE_ROOMS],
      roles: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
  },

  STORE: {
    CART: {
      description: 'Carrito de compras',
      icon: 'shopping-cart',
      isPublic: true,
      label: 'Carrito',
      path: '/store/cart',
    },
    EVENT_DETAIL: {
      description: 'Detalle del evento',
      icon: 'calendar',
      isPublic: true,
      label: 'Evento',
      path: '/store/event/:handle',
    },
    MAIN: {
      description: 'Explorar todos los productos',
      icon: 'shopping-bag',
      isPublic: true,
      label: 'Tienda',
      path: '/store',
    },
    PRODUCT_DETAIL: {
      description: 'Detalle del producto',
      icon: 'package',
      isPublic: true,
      label: 'Producto',
      path: '/store/product/:handle',
    },
    SEARCH: {
      description: 'Búsqueda de productos',
      icon: 'search',
      isPublic: true,
      label: 'Buscar',
      path: '/store/search',
    },
  },

  TICKETS: {
    MAIN: {
      icon: 'ticket',
      label: 'Gestionar Tickets',
      path: '/manage-tickets',
      permissions: [PERMISSIONS.MANAGE_TICKETS],
      roles: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.ARTIST.NAME],
    },
  },

  USUARIOS: {
    DETAIL: {
      icon: 'edit',
      label: 'Editar Usuario',
      path: '/admin/users/:id',
      permissions: [PERMISSIONS.MANAGE_USERS],
      roles: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
    MAIN: {
      description: 'Gestionar Usuarios',
      icon: 'users',
      label: 'Usuarios',
      path: '/admin/users',
      permissions: [PERMISSIONS.MANAGE_USERS],
      roles: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
    },
  },

  UTILITY: {
    NOT_FOUND: {
      hideInNav: true,
      isPublic: true,
      label: 'Página no encontrada',
      path: '/404',
    },
    SERVER_ERROR: {
      hideInNav: true,
      isPublic: true,
      label: 'Error del servidor',
      path: '/500',
    },
    UNAUTHORIZED: {
      hideInNav: true,
      isPublic: true,
      label: 'No autorizado',
      path: '/unauthorized',
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
    .filter((route) => route.isPublic)
    .map((route) => route.path)
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
    const hasRequiredRole = !route.roles || route.roles.some((role) => userRoles.includes(role))
    const hasRequiredPermissions =
      !route.permissions ||
      route.permissions.every((permission) => userPermissions.includes(permission))

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
    ROUTES.EVENTOS.MAIN,
    ROUTES.USUARIOS.MAIN,
    ROUTES.SALAS_PRIVADAS.MAIN,
    ROUTES.INVENTARIO.MAIN,
    ROUTES.TICKETS.MAIN,
  ]

  return filterRoutesByAccess(navigationRoutes, userRoles, userPermissions).filter(
    (route) => !route.hideInNav
  )
}

export const getStoreNavRoutes = (): RouteConfig[] => {
  const publicStoreRoutes = [ROUTES.PUBLIC.HOME, ROUTES.STORE.MAIN, ROUTES.COLLECTIONS.MAIN]

  return publicStoreRoutes.filter((route) => 'hideInNav' in route && !route.hideInNav)
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
    if (route.path.includes(':')) {
      const pattern = route.path.replace(/:[^/]+/g, '[^/]+')
      const regex = new RegExp(`^${pattern}$`)
      return regex.test(pathname)
    }
    return route.path === pathname
  })

  if (!route) return { isPublic: false }

  return {
    isPublic: route.isPublic ?? false,
    requiredPermissions: route.permissions,
    requiredRoles: route.roles,
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
    if (r.path.includes(':')) {
      const pattern = r.path.replace(/:[^/]+/g, '[^/]+')
      const regex = new RegExp(`^${pattern}$`)
      return regex.test(pathname)
    }
    return r.path === pathname
  })

  if (route && route.path !== '/admin') {
    breadcrumbs.push({
      label: route.breadcrumb ?? route.label,
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
      if (r.path.includes(':')) {
        const pattern = r.path.replace(/:[^/]+/g, '[^/]+')
        const regex = new RegExp(`^${pattern}$`)
        return regex.test(currentPath)
      }
      return r.path === currentPath
    })

    if (route) {
      breadcrumbs.push({
        label: route.breadcrumb ?? route.label,
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
  return getAllRoutes().filter((route) => route.permissions?.includes(permission))
}

export const getRoutesByRole = (role: string): RouteConfig[] => {
  return getAllRoutes().filter((route) => route.roles?.includes(role))
}
