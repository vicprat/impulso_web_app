import * as Icons from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { type RouteConfig } from '@/config/routes'
import { useRoutes } from '@/hooks/useRoutes'
import { cn } from '@/lib/utils'

interface RouteLinkProps {
  route: RouteConfig
  className?: string
  activeClassName?: string
  onClick?: () => void
}

export const RouteLink: React.FC<RouteLinkProps> = ({ className, onClick, route }) => {
  const { canAccessRoute } = useRoutes()

  if (!canAccessRoute(route)) return null

  const IconComponent =
    route.ICON && typeof Icons[route.ICON as keyof typeof Icons] === 'function'
      ? (Icons[route.ICON as keyof typeof Icons] as React.ElementType)
      : null

  return (
    <Link
      href={route.PATH}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        className
      )}
      onClick={onClick}
    >
      {IconComponent && <IconComponent className='size-4' />}
      <span>{route.LABEL}</span>
      {route.BADGE && (
        <Badge variant='secondary' className='ml-auto'>
          {route.BADGE}
        </Badge>
      )}
    </Link>
  )
}
