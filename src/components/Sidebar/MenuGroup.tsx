'use client';

import { RouteConfig } from '@/config/routes'; 
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Icons } from '@/components/ui/icons';
import { MenuItem } from './MenuItem';
import { usePathname } from 'next/navigation';

type Props = {
  route: RouteConfig;
};

export const MenuGroup: React.FC<Props> = ({ route }) => {
  const pathname = usePathname();
  const IconComponent = route.icon ? Icons[route.icon as keyof typeof Icons] : null;

  const isGroupActive = route.children?.some(child => pathname.startsWith(child.path));

  return (
    <Accordion type="single" collapsible defaultValue={isGroupActive ? route.path : undefined}>
      <AccordionItem value={route.path} className="border-b-0">
        <AccordionTrigger
          className={`flex items-center p-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground ${isGroupActive ? 'bg-accent text-accent-foreground' : ''}`}
        >
          <div className="flex items-center">
             {IconComponent && <IconComponent className="h-4 w-4 mr-3" />}
             <span className="truncate group-data-[collapsible=icon]:hidden">{route.label}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pl-6 pb-0 group-data-[collapsible=icon]:hidden">
           <div className="space-y-1">
            {route.children?.map(child => (
              !child.hideInNav && (
                <MenuItem
                  key={child.path}
                  route={child}
                  isActive={pathname === child.path}
                />
              )
            ))}
           </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};