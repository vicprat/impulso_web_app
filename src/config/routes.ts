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
    BLOG: {
      CREATE: {
        ICON: 'plus',
        LABEL: 'Crear Post',
        PATH: '/posts/create',
        PERMISSIONS: [PERMISSIONS.MANAGE_ALL_BLOG_POSTS, PERMISSIONS.MANAGE_OWN_BLOG_POSTS],
        ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.ARTIST.NAME],
      },
      DETAIL: {
        ICON: 'edit',
        LABEL: 'Editar Post',
        PATH: '/posts/:id',
        PERMISSIONS: [PERMISSIONS.MANAGE_ALL_BLOG_POSTS, PERMISSIONS.MANAGE_OWN_BLOG_POSTS],
        ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.ARTIST.NAME],
      },
      MAIN: {
        DESCRIPTION: 'Gestionar entradas del blog',
        ICON: 'newspaper',
        LABEL: 'Posts',
        PATH: '/posts',
        PERMISSIONS: [PERMISSIONS.MANAGE_ALL_BLOG_POSTS, PERMISSIONS.MANAGE_OWN_BLOG_POSTS],
        ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.ARTIST.NAME],
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
        LABEL: 'Detalle del Evento',
        PATH: '/admin/events/:eventId',
        PERMISSIONS: [PERMISSIONS.MANAGE_EVENTS],
        ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
      },
      FINANCE: {
        ICON: 'dollar-sign',
        LABEL: 'Finanzas del Evento',
        PATH: '/admin/events/:eventId/finance',
        PERMISSIONS: [PERMISSIONS.MANAGE_EVENTS, PERMISSIONS.VIEW_FINANCIAL_ENTRIES],
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
    },
    FINANCE: {
      BANK_ACCOUNTS: {
        CREATE: {
          ICON: 'plus',
          LABEL: 'Crear Cuenta Bancaria',
          PATH: '/admin/finance/bank-accounts/new',
          PERMISSIONS: [PERMISSIONS.MANAGE_BANK_ACCOUNTS],
          ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
        },
        DETAIL: {
          ICON: 'edit',
          LABEL: 'Detalle de Cuenta Bancaria',
          PATH: '/admin/finance/bank-accounts/:id',
          PERMISSIONS: [PERMISSIONS.VIEW_FINANCIAL_ENTRIES],
          ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
        },
        EDIT: {
          ICON: 'edit',
          LABEL: 'Editar Cuenta Bancaria',
          PATH: '/admin/finance/bank-accounts/:id/edit',
          PERMISSIONS: [PERMISSIONS.MANAGE_BANK_ACCOUNTS],
          ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
        },
        MAIN: {
          DESCRIPTION: 'Gestionar Cuentas Bancarias',
          ICON: 'credit-card',
          LABEL: 'Cuentas Bancarias',
          PATH: '/admin/finance/bank-accounts',
          PERMISSIONS: [PERMISSIONS.VIEW_FINANCIAL_ENTRIES],
          ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
        },
      },
      ENTRIES: {
        CREATE: {
          ICON: 'plus',
          LABEL: 'Crear Movimiento',
          PATH: '/admin/finance/entries/new',
          PERMISSIONS: [PERMISSIONS.MANAGE_FINANCIAL_ENTRIES],
          ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
        },
        DETAIL: {
          ICON: 'edit',
          LABEL: 'Detalle de Movimiento',
          PATH: '/admin/finance/entries/:id',
          PERMISSIONS: [PERMISSIONS.VIEW_FINANCIAL_ENTRIES, PERMISSIONS.MANAGE_FINANCIAL_ENTRIES],
          ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
        },
        MAIN: {
          DESCRIPTION: 'Gestionar Movimientos Financieros',
          ICON: 'trending-up',
          LABEL: 'Movimientos',
          PATH: '/admin/finance/entries',
          PERMISSIONS: [PERMISSIONS.VIEW_FINANCIAL_ENTRIES],
          ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
        },
      },
      REPORTS: {
        MAIN: {
          DESCRIPTION: 'Reportes Financieros',
          ICON: 'bar-chart-3',
          LABEL: 'Reportes',
          PATH: '/admin/finance/reports',
          PERMISSIONS: [PERMISSIONS.VIEW_FINANCE_REPORTS],
          ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.PARTNER.NAME],
        },
      },
    },
    GROUP: {
      HIDE_IN_NAV: true,
      ICON: 'settings',
      LABEL: 'Administración',
      PATH: '/admin',
      PERMISSIONS: [PERMISSIONS.ACCESS_ADMIN],
      ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME], // Esta ruta no debe aparecer individualmente
    },
    PRIVATE_ROOMS: {
      ACCESS: {
        ICON: 'lock',
        LABEL: 'Acceder a Sala Privada',
        PATH: '/private-room',
        PERMISSIONS: [PERMISSIONS.VIEW_PRIVATE_ROOMS],
        ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.VIP_CUSTOMER.NAME],
      },
      ACCESS_DETAIL: {
        HIDE_IN_NAV: true,
        ICON: 'eye',
        LABEL: 'Ver Sala Privada',
        PATH: '/private-room/:id',
        PERMISSIONS: [PERMISSIONS.VIEW_PRIVATE_ROOMS],
        ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.VIP_CUSTOMER.NAME],
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
  },

  // (sección ADMIN ya declarada arriba)
  ARTIST: {
    DASHBOARD: {
      DESCRIPTION: 'Dashboard específico para artistas',
      ICON: 'palette',
      LABEL: 'Mi Dashboard',
      PATH: '/artist-dashboard',
      PERMISSIONS: [PERMISSIONS.VIEW_PROFILE],
      ROLES: [ROLES.ARTIST.NAME],
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

  BLOG: {
    DETAIL: {
      DESCRIPTION: 'Detalle de una entrada del blog',
      ICON: 'newspaper',
      IS_PUBLIC: true,
      LABEL: 'Entrada',
      PATH: '/blog/:slug',
    },
    MAIN: {
      DESCRIPTION: 'Listado del blog',
      ICON: 'newspaper',
      IS_PUBLIC: true,
      LABEL: 'Blog',
      PATH: '/blog',
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

  INVENTORY: {
    COLLECTIONS: {
      DETAIL: {
        ICON: 'edit',
        LABEL: 'Detalle de Colección',
        PATH: '/manage-inventory/collections/:id',
        PERMISSIONS: [PERMISSIONS.MANAGE_INVENTORY, PERMISSIONS.MANAGE_OWN_PRODUCTS],
        ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.ARTIST.NAME],
      },
      MAIN: {
        DESCRIPTION: 'Gestionar Colecciones',
        ICON: 'grid',
        LABEL: 'Colecciones',
        PATH: '/manage-inventory/collections',
        PERMISSIONS: [PERMISSIONS.MANAGE_INVENTORY, PERMISSIONS.MANAGE_OWN_PRODUCTS],
        ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.ARTIST.NAME],
      },
    },
    COUPONS: {
      CREATE: {
        ICON: 'plus',
        LABEL: 'Crear Cupón',
        PATH: '/manage-inventory/coupons/create',
        PERMISSIONS: [PERMISSIONS.MANAGE_INVENTORY, PERMISSIONS.MANAGE_OWN_PRODUCTS],
        ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.ARTIST.NAME],
      },
      DETAIL: {
        ICON: 'edit',
        LABEL: 'Detalle de Cupón',
        PATH: '/manage-inventory/coupons/:id',
        PERMISSIONS: [PERMISSIONS.MANAGE_INVENTORY, PERMISSIONS.MANAGE_OWN_PRODUCTS],
        ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.ARTIST.NAME],
      },
      MAIN: {
        DESCRIPTION: 'Gestionar Cupones',
        ICON: 'tag',
        LABEL: 'Cupones',
        PATH: '/manage-inventory/coupons',
        PERMISSIONS: [PERMISSIONS.MANAGE_INVENTORY, PERMISSIONS.MANAGE_OWN_PRODUCTS],
        ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.ARTIST.NAME],
      },
    },
    CREATE: {
      ICON: 'plus',
      LABEL: 'Crear Producto',
      PATH: '/manage-inventory/create',
      PERMISSIONS: [PERMISSIONS.MANAGE_INVENTORY, PERMISSIONS.MANAGE_OWN_PRODUCTS],
      ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME, ROLES.ARTIST.NAME],
    },
    CREATE_BULK: {
      ICON: 'plus',
      LABEL: 'Crear Productos en Lote',
      PATH: '/manage-inventory/create-bulk',
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
    GROUP: {
      HIDE_IN_NAV: true,
      ICON: 'archive',
      LABEL: 'Gestión de Inventario',
      PATH: '/manage-inventory',
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
    PRIVATE_ROOMS: {
      CREATE: {
        ICON: 'plus',
        LABEL: 'Crear Sala Privada',
        PATH: '/manage-inventory/private-rooms/create',
        PERMISSIONS: [PERMISSIONS.MANAGE_PRIVATE_ROOMS],
        ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
      },
      DETAIL: {
        ICON: 'edit',
        LABEL: 'Editar Sala Privada',
        PATH: '/manage-inventory/private-rooms/:id',
        PERMISSIONS: [PERMISSIONS.MANAGE_PRIVATE_ROOMS],
        ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
      },
      MAIN: {
        DESCRIPTION: 'Gestionar Salas Privadas',
        ICON: 'lock',
        LABEL: 'Salas Privadas',
        PATH: '/manage-inventory/private-rooms',
        PERMISSIONS: [PERMISSIONS.MANAGE_PRIVATE_ROOMS],
        ROLES: [ROLES.MANAGER.NAME, ROLES.ADMIN.NAME],
      },
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
      LABEL: 'Ordenes',
      PATH: '/orders',
      PERMISSIONS: [PERMISSIONS.VIEW_ORDERS],
    },
  },

  PUBLIC: {
    ARTISTS: {
      DESCRIPTION: 'Lista de artistas públicos',
      ICON: 'users',
      IS_PUBLIC: true,
      LABEL: 'Artistas',
      PATH: '/artists',
    },

    HOME: {
      DESCRIPTION: 'Página principal de la tienda',
      ICON: 'home',
      IS_PUBLIC: true,
      LABEL: 'Inicio',
      PATH: '/',
    },
    // Rutas dinámicas para posts por tipo
    POSTS: {
      // Rutas dinámicas que manejan ambos tipos
      DYNAMIC: {
        DETAIL: {
          DESCRIPTION: 'Detalle de un post (blog o evento)',
          ICON: 'file-text',
          IS_PUBLIC: true,
          LABEL: 'Detalle del Post',
          PATH: '/:postType/:slug',
        },
        MAIN: {
          DESCRIPTION: 'Listado de posts por tipo (blog o evento)',
          ICON: 'list',
          IS_PUBLIC: true,
          LABEL: 'Posts',
          PATH: '/:postType',
        },
      },
    },
    PROFILE_DETAIL: {
      DESCRIPTION: 'Perfil Público de un usuario',
      ICON: 'user',
      IS_PUBLIC: true,
      LABEL: 'Perfil Público',
      PATH: '/artists/:userId',
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

    EVENTS: {
      DESCRIPTION: 'Lista de eventos públicos',
      ICON: 'calendar',
      IS_PUBLIC: true,
      LABEL: 'Eventos',
      PATH: '/events',
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
    MEMBERSHIP: {
      DESCRIPTION: 'Plan de membresía para artistas',
      ICON: 'users',
      IS_PUBLIC: true,
      LABEL: 'Membresía',
      PATH: '/membership',
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
    SERVICES: {
      DESCRIPTION: 'Servicios especializados en arte',
      ICON: 'settings',
      IS_PUBLIC: true,
      LABEL: 'Servicios',
      PATH: '/services',
    },
    TERMS: {
      DESCRIPTION: 'Términos y condiciones',
      ICON: 'file-text',
      IS_PUBLIC: true,
      LABEL: 'Términos',
      PATH: '/terms',
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

  const traverse = (obj: object) => {
    Object.values(obj).forEach((value) => {
      if (typeof value === 'object' && value !== null) {
        if ('PATH' in value && typeof (value as any).PATH === 'string') {
          allRoutes.push(value as RouteConfig)
        } else {
          traverse(value)
        }
      }
    })
  }

  traverse(ROUTES)
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
    // Panel Principal
    ROUTES.CUSTOMER.DASHBOARD,
    // Inventario
    ROUTES.INVENTORY.MAIN,
    // Mis Pedidos
    ROUTES.ORDERS.MAIN,
    // Blog
    ROUTES.ADMIN.BLOG.MAIN,
    // Mi Perfil
    ROUTES.CUSTOMER.PROFILE,
    // Rutas administrativas agrupadas
    ROUTES.ADMIN.EVENTS.MAIN,
    ROUTES.ADMIN.USERS.MAIN,
    ROUTES.ADMIN.FINANCE.BANK_ACCOUNTS.MAIN,
    ROUTES.ADMIN.FINANCE.ENTRIES.MAIN,
    ROUTES.ADMIN.FINANCE.REPORTS.MAIN,
    // Rutas individuales que no están en ADMIN
    ROUTES.ADMIN.PRIVATE_ROOMS.ACCESS,
    ROUTES.TICKETS.MAIN,
  ]

  return filterRoutesByAccess(navigationRoutes, userRoles, userPermissions).filter(
    (route) => !route.HIDE_IN_NAV
  )
}

export const getGroupedDashboardNavRoutes = (
  userRoles: string[],
  userPermissions: string[]
): {
  groupedRoutes: RouteConfig[]
  individualRoutes: RouteConfig[]
  inventoryGroupRoutes: RouteConfig[]
} => {
  const allRoutes = getDashboardNavRoutes(userRoles, userPermissions)

  // Rutas que deben estar agrupadas bajo Administración
  const adminGroupRoutes = [
    ROUTES.ADMIN.EVENTS.MAIN,
    ROUTES.ADMIN.USERS.MAIN,
    ROUTES.ADMIN.FINANCE.BANK_ACCOUNTS.MAIN,
    ROUTES.ADMIN.FINANCE.ENTRIES.MAIN,
    ROUTES.ADMIN.FINANCE.REPORTS.MAIN,
  ].filter(
    (route) =>
      filterRoutesByAccess([route], userRoles, userPermissions).length > 0 &&
      !('HIDE_IN_NAV' in route && route.HIDE_IN_NAV)
  )

  // Rutas que deben estar agrupadas bajo Gestión de Inventario
  const inventoryGroupRoutes = [
    ROUTES.INVENTORY.MAIN,
    ROUTES.INVENTORY.COUPONS.MAIN,
    ROUTES.INVENTORY.COLLECTIONS.MAIN,
    ROUTES.INVENTORY.PRIVATE_ROOMS.MAIN,
  ].filter(
    (route) =>
      filterRoutesByAccess([route], userRoles, userPermissions).length > 0 &&
      !('HIDE_IN_NAV' in route && route.HIDE_IN_NAV)
  )

  // Rutas que deben estar individuales (incluyendo ACCESS que no está en el grupo)
  const individualRoutes = allRoutes.filter(
    (route) =>
      !adminGroupRoutes.some((adminRoute) => adminRoute.PATH === route.PATH) &&
      !inventoryGroupRoutes.some((inventoryRoute) => inventoryRoute.PATH === route.PATH)
  )

  return {
    groupedRoutes: adminGroupRoutes,
    individualRoutes,
    inventoryGroupRoutes,
  }
}

export const getStoreNavRoutes = (): RouteConfig[] => {
  const publicStoreRoutes = [
    ROUTES.PUBLIC.HOME,
    ROUTES.STORE.MAIN,
    ROUTES.COLLECTIONS.MAIN,
    {
      ...ROUTES.PUBLIC.POSTS.DYNAMIC.MAIN,
      LABEL: 'Blog',
      PATH: '/blog',
    },
    ROUTES.STORE.EVENTS, // Eventos del store
    ROUTES.PUBLIC.ARTISTS,
  ]

  return publicStoreRoutes.filter((route) => !('HIDE_IN_NAV' in route && route.HIDE_IN_NAV))
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
  DYNAMIC_BANK_ACCOUNT_ID: ':id',
  DYNAMIC_COLLECTION: ':collection',
  DYNAMIC_ENTRY_ID: ':id',
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
