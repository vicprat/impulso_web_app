'use client';

import { usePathname } from 'next/navigation';
import { useRoutes } from '@/hooks/useRoutes';
import { RouteLink } from './RouteLink';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const { dashboardNavRoutes } = useRoutes();

  // Agrupar rutas por sección
  const customerRoutes = dashboardNavRoutes.filter(
    route => !route.path.startsWith('/admin') && !route.path.startsWith('/support')
  );
  
  const supportRoutes = dashboardNavRoutes.filter(
    route => route.path.startsWith('/support')
  );
  
  const adminRoutes = dashboardNavRoutes.filter(
    route => route.path.startsWith('/admin')
  );

  return (
    <ScrollArea className="h-full py-6 px-4">
      <div className="space-y-6">
        {/* Rutas del cliente */}
        {customerRoutes.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground px-3 mb-2">
              Mi Cuenta
            </h4>
            {customerRoutes.map((route) => (
              <RouteLink
                key={route.path}
                route={route}
                activeClassName={pathname === route.path ? "bg-accent" : ""}
              />
            ))}
          </div>
        )}

        {/* Rutas de soporte */}
        {supportRoutes.length > 0 && (
          <>
            <Separator />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground px-3 mb-2">
                Soporte
              </h4>
              {supportRoutes.map((route) => (
                <div key={route.path}>
                  <RouteLink
                    route={route}
                    activeClassName={pathname.startsWith(route.path) ? "bg-accent" : ""}
                  />
                  {route.children && (
                    <div className="ml-4 mt-1 space-y-1">
                      {route.children.map((child) => (
                        <RouteLink
                          key={child.path}
                          route={child}
                          className="text-sm"
                          activeClassName={pathname === child.path ? "bg-accent" : ""}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Rutas administrativas */}
        {adminRoutes.length > 0 && (
          <>
            <Separator />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground px-3 mb-2">
                Administración
              </h4>
              {adminRoutes.map((route) => (
                <div key={route.path}>
                  <RouteLink
                    route={route}
                    activeClassName={pathname.startsWith(route.path) ? "bg-accent" : ""}
                  />
                  {route.children && (
                    <div className="ml-4 mt-1 space-y-1">
                      {route.children.map((child) => (
                        <RouteLink
                          key={child.path}
                          route={child}
                          className="text-sm"
                          activeClassName={pathname === child.path ? "bg-accent" : ""}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
};
