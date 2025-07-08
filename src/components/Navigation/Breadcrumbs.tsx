'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'

import { useRoutes } from '@/hooks/useRoutes'
import { ROUTES } from '@/src/config/routes'

export const Breadcrumbs: React.FC = () => {
  const { breadcrumbs } = useRoutes()

  if (breadcrumbs.length === 0) return null

  return (
    <nav className='flex items-center space-x-1 text-sm'>
      <Link
        href={ROUTES.PUBLIC.HOME.PATH}
        className='text-muted-foreground transition-colors hover:text-foreground'
      >
        <Home className='size-4' />
      </Link>

      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className='flex items-center'>
          <ChevronRight className='mx-1 size-4 text-muted-foreground' />
          {index === breadcrumbs.length - 1 ? (
            <span className='font-medium text-foreground'>{crumb.label}</span>
          ) : (
            <Link
              href={crumb.path}
              className='text-muted-foreground transition-colors hover:text-foreground'
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
