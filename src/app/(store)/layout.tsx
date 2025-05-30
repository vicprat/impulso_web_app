
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Filter } from '@/components/Filter';
import { Search } from '@/components/Search';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-2xl font-bold text-blue-600 flex-shrink-0">
              Mi Tienda
            </Link>
            
            {/* Search Component */}
            <div className="flex-1 max-w-2xl mx-4">
              <Search />
            </div>
            
            <div className="flex items-center space-x-4 flex-shrink-0">
              <Link href="/store" className="text-gray-600 hover:text-gray-800 hidden sm:block">
                Tienda
              </Link>
              <Link href="/store/collections" className="text-gray-600 hover:text-gray-800 hidden sm:block">
                Colecciones
              </Link>
              
              {/* Mobile menu button */}
              <button className="sm:hidden p-2 text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Navigation.Store /> 
        
        <div className="flex gap-6">
          <Filter />
          
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}