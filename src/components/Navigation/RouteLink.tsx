import Link from 'next/link';
import { cn } from '@/lib/utils';
import { RouteConfig } from '@/config/routes';
import { useRoutes } from '@/hooks/useRoutes';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface RouteLinkProps {
  route: RouteConfig;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
}

export const RouteLink: React.FC<RouteLinkProps> = ({
  route,
  className,
  onClick
}) => {
  const { canAccessRoute } = useRoutes();
  
  if (!canAccessRoute(route)) return null;

  const IconComponent = route.icon && typeof Icons[route.icon as keyof typeof Icons] === 'function'
    ? (Icons[route.icon as keyof typeof Icons] as React.ElementType)
    : null;

  return (
    <Link
      href={route.path}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={onClick}
    >
      {IconComponent && <IconComponent className="h-4 w-4" />}
      <span>{route.label}</span>
      {route.badge && (
        <Badge variant="secondary" className="ml-auto">
          {route.badge}
        </Badge>
      )}
    </Link>
  );
};
