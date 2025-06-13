'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useRoutes } from '@/hooks/useRoutes';

export const Breadcrumbs: React.FC = () => {
  const { breadcrumbs } = useRoutes();

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm">
      <Link 
        href="/" 
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link 
              href={crumb.path}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};