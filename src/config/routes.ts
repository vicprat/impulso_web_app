export type RouteConfig = {
  path: string;
  label: string;
  icon?: string;
  description?: string;
  permissions?: string[];
  roles?: string[];
  children?: RouteConfig[];
  isPublic?: boolean;
  hideInNav?: boolean;
  badge?: string | number;
  isExternal?: boolean;
  breadcrumb?: string;
}

// Rutas públicas del storefront
export const PublicStoreRoutes: RouteConfig[] = [
  {
    path: '/',
    label: 'Inicio',
    icon: 'home',
    isPublic: true,
    description: 'Página principal de la tienda'
  },
  {
    path: '/store',
    label: 'Tienda',
    icon: 'shopping-bag',
    isPublic: true,
    description: 'Explorar todos los productos'
  },
  {
    path: '/store/collections',
    label: 'Colecciones',
    icon: 'grid',
    isPublic: true,
    description: 'Ver todas las colecciones'
  },
  {
    path: '/store/search',
    label: 'Buscar',
    icon: 'search',
    isPublic: true,
    hideInNav: true
  }
];

// Rutas de autenticación
export const AuthRoutes: RouteConfig[] = [
  {
    path: '/auth/login',
    label: 'Iniciar Sesión',
    icon: 'log-in',
    isPublic: true,
    hideInNav: true
  },
  {
    path: '/auth/logout',
    label: 'Cerrar Sesión',
    icon: 'log-out',
    hideInNav: true
  },
  {
    path: '/auth/callback',
    label: 'Callback',
    hideInNav: true,
    isPublic: true
  }
];

// Rutas del cliente autenticado
export const CustomerRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    label: 'Panel Principal',
    icon: 'layout-dashboard',
    permissions: ['view_profile'],
    description: 'Tu panel de control personal'
  },
  {
    path: '/profile',
    label: 'Mi Perfil',
    icon: 'user',
    permissions: ['view_profile', 'update_profile'],
    description: 'Gestiona tu información personal'
  },
  {
    path: '/orders',
    label: 'Mis Pedidos',
    icon: 'package',
    permissions: ['view_orders'],
    description: 'Historial de pedidos',
    children: [
      {
        path: '/orders',
        label: 'Todos los Pedidos',
        icon: 'list',
        permissions: ['view_orders']
      },
      {
        path: '/orders/:id',
        label: 'Detalle del Pedido',
        hideInNav: true,
        permissions: ['view_orders'],
        breadcrumb: 'Detalle'
      }
    ]
  },
  {
    path: '/addresses',
    label: 'Direcciones',
    icon: 'map-pin',
    permissions: ['view_addresses', 'manage_addresses'],
    description: 'Gestiona tus direcciones de envío'
  },
  {
    path: '/store/cart',
    label: 'Carrito',
    icon: 'shopping-cart',
    permissions: ['manage_cart'],
    badge: 'cartItemCount' // Indicador dinámico
  }
];

// Rutas VIP (clientes con beneficios adicionales)
export const VipRoutes: RouteConfig[] = [
  {
    path: '/analytics',
    label: 'Mis Estadísticas',
    icon: 'bar-chart',
    roles: ['vip_customer'],
    permissions: ['view_analytics'],
    description: 'Análisis de tus compras'
  },
  {
    path: '/vip-offers',
    label: 'Ofertas VIP',
    icon: 'star',
    roles: ['vip_customer'],
    description: 'Ofertas exclusivas para clientes VIP'
  }
];

// Rutas de soporte
export const SupportRoutes: RouteConfig[] = [
  {
    path: '/support',
    label: 'Panel de Soporte',
    icon: 'headphones',
    roles: ['support', 'manager', 'admin'],
    permissions: ['view_all_orders'],
    children: [
      {
        path: '/support/tickets',
        label: 'Tickets',
        icon: 'message-square',
        permissions: ['view_all_orders']
      },
      {
        path: '/support/customers',
        label: 'Clientes',
        icon: 'users',
        permissions: ['view_all_orders']
      },
      {
        path: '/support/logs',
        label: 'Logs de Actividad',
        icon: 'activity',
        permissions: ['view_logs']
      }
    ]
  }
];

// Rutas administrativas
export const AdminRoutes: RouteConfig[] = [
  {
    path: '/admin',
    label: 'Administración',
    icon: 'settings',
    roles: ['manager', 'admin'],
    permissions: ['access_admin'],
    children: [
      {
        path: '/admin/users',
        label: 'Usuarios',
        icon: 'users',
        permissions: ['manage_users'],
        description: 'Gestión de usuarios del sistema'
      },
      {
        path: '/admin/roles',
        label: 'Roles y Permisos',
        icon: 'shield',
        permissions: ['manage_roles'],
        roles: ['admin']
      },
      {
        path: '/admin/products',
        label: 'Productos',
        icon: 'package',
        permissions: ['manage_products'],
        description: 'Gestión del catálogo'
      },
      {
        path: '/admin/inventory',
        label: 'Inventario',
        icon: 'archive',
        permissions: ['manage_inventory']
      },
      {
        path: '/admin/analytics',
        label: 'Analíticas',
        icon: 'trending-up',
        permissions: ['view_analytics'],
        roles: ['manager', 'admin']
      }
    ]
  }
];

// Rutas dinámicas del store (no aparecen en navegación)
export const DynamicStoreRoutes: RouteConfig[] = [
  {
    path: '/store/product/:handle',
    label: 'Producto',
    isPublic: true,
    hideInNav: true,
    breadcrumb: 'Producto'
  },
  {
    path: '/store/collections/:handle',
    label: 'Colección',
    isPublic: true,
    hideInNav: true,
    breadcrumb: 'Colección'
  }
];

// Rutas de error y utilidad
export const UtilityRoutes: RouteConfig[] = [
  {
    path: '/404',
    label: 'Página no encontrada',
    hideInNav: true,
    isPublic: true
  },
  {
    path: '/500',
    label: 'Error del servidor',
    hideInNav: true,
    isPublic: true
  },
  {
    path: '/unauthorized',
    label: 'No autorizado',
    hideInNav: true,
    isPublic: true
  }
];

// Función para obtener todas las rutas públicas
export const getAllPublicRoutes = (): string[] => {
  const publicRoutes = [
    ...PublicStoreRoutes,
    ...AuthRoutes,
    ...DynamicStoreRoutes,
    ...UtilityRoutes
  ]
    .filter(route => route.isPublic)
    .map(route => route.path);
  
  return publicRoutes;
};

// Función para verificar si una ruta es pública
export const isPublicRoute = (path: string): boolean => {
  // Rutas estáticas públicas
  const staticPublic = getAllPublicRoutes().some(route => {
    if (route.includes(':')) {
      // Manejar rutas dinámicas
      const pattern = route.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    }
    return route === path || (route !== '/' && path.startsWith(route + '/'));
  });
  
  return staticPublic;
};

// Función para obtener rutas por rol
export const getRoutesByRole = (userRoles: string[], userPermissions: string[]): RouteConfig[] => {
  const allRoutes = [
    ...CustomerRoutes,
    ...VipRoutes,
    ...SupportRoutes,
    ...AdminRoutes
  ];
  
  return filterRoutesByAccess(allRoutes, userRoles, userPermissions);
};

// Función para filtrar rutas basadas en roles y permisos
export const filterRoutesByAccess = (
  routes: RouteConfig[], 
  userRoles: string[], 
  userPermissions: string[]
): RouteConfig[] => {
  return routes.filter(route => {
    // Si no hay restricciones, mostrar
    if (!route.roles && !route.permissions) return true;
    
    // Verificar roles
    const hasRequiredRole = !route.roles || route.roles.some(role => userRoles.includes(role));
    
    // Verificar permisos
    const hasRequiredPermission = !route.permissions || 
      route.permissions.every(permission => userPermissions.includes(permission));
    
    return hasRequiredRole && hasRequiredPermission;
  }).map(route => {
    // Filtrar children recursivamente
    if (route.children) {
      return {
        ...route,
        children: filterRoutesByAccess(route.children, userRoles, userPermissions)
      };
    }
    return route;
  });
};

// Función para obtener rutas de navegación del store
export const getStoreNavRoutes = (): RouteConfig[] => {
  return PublicStoreRoutes.filter(route => !route.hideInNav);
};

// Función para obtener rutas del dashboard del usuario
export const getDashboardNavRoutes = (userRoles: string[], userPermissions: string[]): RouteConfig[] => {
  const routes = getRoutesByRole(userRoles, userPermissions);
  return routes.filter(route => !route.hideInNav);
};

// Función para construir breadcrumbs
export const buildBreadcrumbs = (pathname: string, routes: RouteConfig[]): Array<{label: string; path: string}> => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Array<{label: string; path: string}> = [];
  
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Buscar la ruta correspondiente
    const route = findRouteByPath(currentPath, routes);
    if (route) {
      breadcrumbs.push({
        label: route.breadcrumb || route.label,
        path: currentPath
      });
    } else if (segment.match(/^[a-zA-Z0-9-]+$/)) {
      // Es un parámetro dinámico
      const parentPath = segments.slice(0, index).join('/');
      const dynamicRoute = findDynamicRoute(`${parentPath}/:param`, routes);
      if (dynamicRoute) {
        breadcrumbs.push({
          label: dynamicRoute.breadcrumb || segment,
          path: currentPath
        });
      }
    }
  });
  
  return breadcrumbs;
};

// Función auxiliar para encontrar ruta por path
const findRouteByPath = (path: string, routes: RouteConfig[]): RouteConfig | null => {
  for (const route of routes) {
    if (route.path === path) return route;
    if (route.children) {
      const found = findRouteByPath(path, route.children);
      if (found) return found;
    }
  }
  return null;
};

// Función auxiliar para encontrar rutas dinámicas
const findDynamicRoute = (pattern: string, routes: RouteConfig[]): RouteConfig | null => {
  for (const route of routes) {
    if (route.path.includes(':') && matchDynamicRoute(pattern, route.path)) {
      return route;
    }
    if (route.children) {
      const found = findDynamicRoute(pattern, route.children);
      if (found) return found;
    }
  }
  return null;
};

// Función para hacer match de rutas dinámicas
const matchDynamicRoute = (path: string, pattern: string): boolean => {
  const pathSegments = path.split('/').filter(Boolean);
  const patternSegments = pattern.split('/').filter(Boolean);
  
  if (pathSegments.length !== patternSegments.length) return false;
  
  return patternSegments.every((segment, index) => {
    return segment.startsWith(':') || segment === pathSegments[index];
  });
};

// Función para obtener meta información de la ruta actual
export const getRouteMeta = (pathname: string): {
  isPublic: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
} => {
  const allRoutes = [
    ...PublicStoreRoutes,
    ...AuthRoutes,
    ...CustomerRoutes,
    ...VipRoutes,
    ...SupportRoutes,
    ...AdminRoutes,
    ...DynamicStoreRoutes,
    ...UtilityRoutes
  ];
  
  const route = findRouteByPath(pathname, allRoutes) || 
                findDynamicRoute(pathname, allRoutes);
  
  if (!route) {
    return { isPublic: false };
  }
  
  return {
    isPublic: route.isPublic || false,
    requiredRoles: route.roles,
    requiredPermissions: route.permissions
  };
};