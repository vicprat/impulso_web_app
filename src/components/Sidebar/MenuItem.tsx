'use client'

import Link from 'next/link'

import { Icons, type IconName } from '@/components/ui/icons'
import { type RouteConfig } from '@/config/routes'

interface Props {
  route: RouteConfig
  isActive: boolean
}

export const MenuItem: React.FC<Props> = ({ isActive, route }) => {
  const IconComponent = route.ICON ? Icons[route.ICON as IconName] : null

  return (
    <Link
      href={route.PATH}
      className={`flex items-center rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
    >
      {IconComponent && <IconComponent className='mr-3 size-4' />}
      <span className='truncate group-data-[collapsible=icon]:hidden'>{route.LABEL}</span>
    </Link>
  )
}
