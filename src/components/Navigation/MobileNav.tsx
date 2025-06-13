'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useRoutes } from '@/hooks/useRoutes';
import { RouteLink } from './RouteLink';

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const { isStorePage, storeNavRoutes, dashboardNavRoutes } = useRoutes();

  const routes = isStorePage ? storeNavRoutes : dashboardNavRoutes;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <nav className="flex flex-col space-y-4 mt-6">
          {routes.map((route) => (
            <div key={route.path}>
              <RouteLink
                route={route}
                onClick={() => setOpen(false)}
              />
              {route.children && (
                <div className="ml-4 mt-2 space-y-2">
                  {route.children.map((child) => (
                    <RouteLink
                      key={child.path}
                      route={child}
                      className="text-sm"
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};