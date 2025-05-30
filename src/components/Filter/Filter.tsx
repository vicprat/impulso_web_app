'use client';
import { useCollections } from "@/modules/shopify/hooks";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type State = {
  collections: string[];
  priceRange: {
    min: string;
    max: string;
  };
  availability: 'all' | 'available' | 'unavailable';
  sortBy: 'BEST_SELLING' | 'PRICE' | 'TITLE' | 'CREATED';
  sortOrder: 'asc' | 'desc';
}

const defaultFilters: State = {
  collections: [],
  priceRange: { min: '', max: '' },
  availability: 'all',
  sortBy: 'BEST_SELLING',
  sortOrder: 'asc'
};

export const Filter = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const { data: collectionsData } = useCollections();

  const handleFilterChange = <K extends keyof State>(key: K, value: State[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCollectionToggle = (collectionHandle: string) => {
    setFilters(prev => ({
      ...prev,
      collections: prev.collections.includes(collectionHandle)
        ? prev.collections.filter(c => c !== collectionHandle)
        : [...prev.collections, collectionHandle]
    }));
  };

  const applyFilters = () => {
    const searchParams = new URLSearchParams();
    
    if (filters.collections.length > 0) {
      searchParams.set('collections', filters.collections.join(','));
    }
    if (filters.priceRange.min) {
      searchParams.set('price_min', filters.priceRange.min);
    }
    if (filters.priceRange.max) {
      searchParams.set('price_max', filters.priceRange.max);
    }
    if (filters.availability !== 'all') {
      searchParams.set('availability', filters.availability);
    }
    if (filters.sortBy !== 'BEST_SELLING') {
      searchParams.set('sort', filters.sortBy);
    }
    if (filters.sortOrder !== 'asc') {
      searchParams.set('order', filters.sortOrder);
    }

    const queryString = searchParams.toString();
    
    // Decidir a qué página redirigir basado en la página actual
    let targetPath = '/store';
    if (pathname.includes('/search') || queryString) {
      targetPath = '/store/search';
    }
    
    const newPath = queryString ? `${targetPath}?${queryString}` : '/store';
    router.push(newPath);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    router.push('/store');
  };

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          Filtros
        </button>
      </div>

      {/* Filter Sidebar */}
      <div className={`
        lg:block lg:w-64 bg-white border-r border-gray-200 h-full
        ${isOpen ? 'block fixed inset-0 z-50 lg:relative lg:inset-auto' : 'hidden'}
      `}>
        <div className="p-6 h-full overflow-y-auto">
          {/* Mobile Close Button */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Filtros</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-6 hidden lg:block">Filtros</h2>

          {/* Collections Filter */}
          {collectionsData?.collections && collectionsData.collections.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Colecciones</h3>
              <div className="space-y-2">
                {collectionsData.collections.map(collection => (
                  <label key={collection.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.collections.includes(collection.handle)}
                      onChange={() => handleCollectionToggle(collection.handle)}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm">{collection.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Rango de precio</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min}
                onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max}
                onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>

          {/* Availability Filter */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Disponibilidad</h3>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'available', label: 'Disponible' },
                { value: 'unavailable', label: 'Agotado' }
              ].map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="availability"
                    value={option.value}
                    checked={filters.availability === option.value}
                    onChange={(e) => handleFilterChange('availability', e.target.value as State['availability'])}
                    className="mr-2"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Ordenar por</h3>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value as State['sortBy'])}
              className="w-full p-2 border border-gray-300 rounded text-sm mb-2"
            >
              <option value="BEST_SELLING">Más vendidos</option>
              <option value="PRICE">Precio</option>
              <option value="TITLE">Nombre</option>
              <option value="CREATED">Fecha de creación</option>
            </select>
            
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value as State['sortOrder'])}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={applyFilters}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aplicar filtros
            </button>
            <button
              onClick={clearFilters}
              className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}