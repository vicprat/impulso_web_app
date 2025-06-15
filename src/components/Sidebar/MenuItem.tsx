'use client';

import Link from 'next/link';
import { RouteConfig } from '@/config/routes';
import { Icons, IconName } from '@/components/ui/icons'; 

type Props = {
  route: RouteConfig;
  isActive: boolean;
};

export const MenuItem: React.FC<Props> = ({ route, isActive }) => {
  const IconComponent = route.icon ? Icons[route.icon as IconName] : null;

  return (
    <Link
      href={route.path}
      className={`flex items-center p-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
    >
      {IconComponent && <IconComponent className="h-4 w-4 mr-3" />}
      <span className="truncate group-data-[collapsible=icon]:hidden">{route.label}</span>
    </Link>
  );
};