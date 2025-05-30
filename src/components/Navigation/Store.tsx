"use client"

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export const Store = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const navItems = [
    { 
      href: '/store', 
      label: 'Todos los productos', 
      exact: true,
      description: 'Explora todo nuestro catálogo'
    },
    { 
      href: '/store/collections', 
      label: 'Colecciones', 
      exact: false,
      description: 'Productos organizados por categorías'
    },
  ];

  const isSearchPage = pathname.includes('/search');
  const searchQuery = searchParams.get('q');
  
  const isCollectionPage = pathname.includes('/collections/') && pathname.split('/').length > 3;
  const collectionHandle = isCollectionPage ? pathname.split('/').pop() : null;

  return (
    <nav className="bg-white border-b border-gray-200 mb-6">
      <div className="flex items-center justify-between">
        {/* Navigation Links */}
        <div className="flex space-x-8">
          {navItems.map(item => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href) && !isSearchPage;
              
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-4 border-b-2 font-medium text-sm transition-colors group ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="block">{item.label}</span>
                <span className="text-xs text-gray-400 group-hover:text-gray-500 hidden sm:block">
                  {item.description}
                </span>
              </Link>
            );
          })}
          
          {/* Search Page Indicator */}
          {isSearchPage && (
            <div className="py-4 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
              <span className="block">
                {searchQuery ? `Resultados: "${searchQuery}"` : 'Búsqueda'}
              </span>
              <span className="text-xs text-gray-400 hidden sm:block">
                Productos filtrados
              </span>
            </div>
          )}
          
          {/* Collection Page Indicator */}
          {isCollectionPage && (
            <div className="py-4 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
              <span className="block">
                Colección: {collectionHandle?.replace('-', ' ')}
              </span>
              <span className="text-xs text-gray-400 hidden sm:block">
                Productos de esta colección
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-4">
          {/* View Toggle (optional) */}
          <div className="hidden lg:flex items-center space-x-2">
            <span className="text-xs text-gray-500">Vista:</span>
            <div className="flex border border-gray-300 rounded">
              <button
                className="p-1 text-gray-400 hover:text-gray-600 border-r border-gray-300"
                title="Vista de grilla"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Vista de lista"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Back to Store (cuando estamos en páginas específicas) */}
          {(pathname.includes('/product/') || isCollectionPage) && (
            <Link
              href="/store"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a la tienda
            </Link>
          )}
        </div>
      </div>
      
      {/* Breadcrumb for deep pages */}
      {(pathname.includes('/product/') || isCollectionPage) && (
        <div className="py-2 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">Inicio</Link>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <Link href="/store" className="hover:text-gray-700">Tienda</Link>
            
            {isCollectionPage && (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link href="/store/collections" className="hover:text-gray-700">Colecciones</Link>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 capitalize">
                  {collectionHandle?.replace('-', ' ')}
                </span>
              </>
            )}
            
            {pathname.includes('/product/') && (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Producto</span>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}