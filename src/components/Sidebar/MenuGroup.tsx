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
  children?: RouteConfig[]
}

export const MenuGroup: React.FC<Props> = ({ children = [], route }) => {
  const pathname = usePathname()
  const IconComponent = route.ICON ? Icons[route.ICON as keyof typeof Icons] : null

  const isGroupActive = children.some((child) => pathname.startsWith(child.PATH))

  return (
    <Accordion type='single' collapsible defaultValue={isGroupActive ? route.PATH : undefined}>
      <AccordionItem value={route.PATH} className='border-b-0'>
        <AccordionTrigger
          className={`flex items-center rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground ${isGroupActive ? 'bg-accent text-accent-foreground' : ''}`}
        >
          <div className='flex items-center'>
            {IconComponent && <IconComponent className='mr-3 size-4' />}
            <span className='truncate group-data-[collapsible=icon]:hidden'>{route.LABEL}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className='pb-0 pl-6 group-data-[collapsible=icon]:hidden'>
          <div className='space-y-1'>
            {children.map(
              (child) =>
                !child.HIDE_IN_NAV && (
                  <MenuItem key={child.PATH} route={child} isActive={pathname === child.PATH} />
                )
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
