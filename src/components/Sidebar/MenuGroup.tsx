'use client'

import { usePathname } from 'next/navigation'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Icons } from '@/components/ui/icons'
import { type RouteConfig } from '@/config/routes'

import { MenuItem } from './MenuItem'

interface Props {
  route: RouteConfig
}

export const MenuGroup: React.FC<Props> = ({ route }) => {
  const pathname = usePathname()
  const IconComponent = route.icon ? Icons[route.icon as keyof typeof Icons] : null

  const isGroupActive = route.children?.some((child) => pathname.startsWith(child.path))

  return (
    <Accordion type='single' collapsible defaultValue={isGroupActive ? route.path : undefined}>
      <AccordionItem value={route.path} className='border-b-0'>
        <AccordionTrigger
          className={`flex items-center rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground ${isGroupActive ? 'bg-accent text-accent-foreground' : ''}`}
        >
          <div className='flex items-center'>
            {IconComponent && <IconComponent className='mr-3 size-4' />}
            <span className='truncate group-data-[collapsible=icon]:hidden'>{route.label}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className='pb-0 pl-6 group-data-[collapsible=icon]:hidden'>
          <div className='space-y-1'>
            {route.children?.map(
              (child) =>
                !child.hideInNav && (
                  <MenuItem key={child.path} route={child} isActive={pathname === child.path} />
                )
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
