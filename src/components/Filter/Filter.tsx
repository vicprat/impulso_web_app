'use client';

import { useCollections, useFilterOptions } from "@/modules/shopify/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Filter as FilterIcon, 
  ChevronDown, 
  X, 
  Search,
  Palette,
  User,
  Tag,
  Grid3X3,
  DollarSign,
  Package,
  Square,
  MapPin,
  CalendarDays,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// El estado del filtro se mantiene, los tags inteligentes se consolidarán en `tags`.
type State = {
  collections: string[];
  productTypes: string[];
  vendors: string[];     
  tags: string[];        
  priceRange: {
    min: string;
    max: string;
  };
  availability: 'all' | 'available' | 'unavailable';
}

const defaultFilters: State = {
  collections: [],
  productTypes: [],
  vendors: [],      
  tags: [],         
  priceRange: { min: '', max: '' },
  availability: 'all'
};

const availabilityOptions = [
  { value: 'all', label: 'Todos los productos', icon: Grid3X3 },
  { value: 'available', label: 'Solo disponibles', icon: Package },
  { value: 'unavailable', label: 'Agotados', icon: X }
] as const;

const FilterSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardContent className="p-4">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-8 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

interface FilterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Filter = ({ isOpen, onClose }: FilterProps) => {
  const [filters, setFilters] = useState(defaultFilters);
  const [openSections, setOpenSections] = useState<string[]>(['collections', 'price']);
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: collectionsData } = useCollections();
  const { data: filterOptions, isLoading: isLoadingFilters } = useFilterOptions();

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleOptionToggle = (
    key: 'collections' | 'productTypes' | 'vendors' | 'tags',
    value: string
  ) => {
    const currentValues = filters[key];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setFilters(prev => ({ ...prev, [key]: newValues }));
  };

  const removeFilter = (
    key: 'collections' | 'productTypes' | 'vendors' | 'tags',
    value: string
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].filter(v => v !== value)
    }));
  };

  const handleFilterChange = <K extends keyof State>(key: K, value: State[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    ['collections', 'product_types', 'vendor', 'tags', 'price_min', 'price_max', 'availability']
      .forEach(param => newSearchParams.delete(param));
    
    if (filters.collections.length > 0) newSearchParams.set('collections', filters.collections.join(','));
    if (filters.productTypes.length > 0) newSearchParams.set('product_types', filters.productTypes.join(',')); 
    if (filters.vendors.length > 0) newSearchParams.set('vendor', filters.vendors.join(','));
    if (filters.tags.length > 0) newSearchParams.set('tags', filters.tags.join(','));

    if (filters.priceRange.min) newSearchParams.set('price_min', filters.priceRange.min);
    if (filters.priceRange.max) newSearchParams.set('price_max', filters.priceRange.max);
    if (filters.availability !== 'all') newSearchParams.set('availability', filters.availability);

    newSearchParams.delete('page');
    
    const queryString = newSearchParams.toString();
    const newPath = queryString ? `/store/search?${queryString}` : '/store';
    
    router.push(newPath);
    onClose();
  };
  
  const collectionOptions = useMemo(() => 
    collectionsData?.collections.map(c => ({ value: c.handle, label: c.title })) || [], 
    [collectionsData]
  );

  const artistOptions = useMemo(() => 
    filterOptions?.artists.map(v => ({ value: v.input, label: v.label })) || [],
    [filterOptions]
  );

  const productTypeOptions = useMemo(() =>
    filterOptions?.productTypes.map(pt => ({ value: pt.input, label: pt.label })) || [],
    [filterOptions]
  );
  
  // --> CORREGIDO: Se mapea la propiedad `input` a `value` para que coincida con el tipo esperado por FilterSection.
  const techniqueOptions = useMemo(() => filterOptions?.techniques.map(o => ({ value: o.input, label: o.label })).sort((a, b) => a.label.localeCompare(b.label)) || [], [filterOptions]);
  const formatOptions = useMemo(() => filterOptions?.formats.map(o => ({ value: o.input, label: o.label })).sort((a, b) => a.label.localeCompare(b.label)) || [], [filterOptions]);
  const locationOptions = useMemo(() => filterOptions?.locations.map(o => ({ value: o.input, label: o.label })).sort((a, b) => a.label.localeCompare(b.label)) || [], [filterOptions]);
  const yearOptions = useMemo(() => filterOptions?.years.map(o => ({ value: o.input, label: o.label })).sort((a, b) => b.label.localeCompare(a.label)) || [], [filterOptions]);
  const otherTagOptions = useMemo(() => filterOptions?.otherTags.map(o => ({ value: o.input, label: o.label })).sort((a, b) => a.label.localeCompare(b.label)) || [], [filterOptions]);

  const clearFilters = () => {
    setFilters(defaultFilters);
    setSearchTerms({});
    const currentSort = searchParams.get('sort');
    const currentOrder = searchParams.get('order');
    
    let newPath = '/store';
    if (currentSort || currentOrder) {
      const sortParams = new URLSearchParams();
      if (currentSort) sortParams.set('sort', currentSort);
      if (currentOrder) sortParams.set('order', currentOrder);
      newPath = `/store/search?${sortParams.toString()}`;
    }
    
    router.push(newPath);
    onClose();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    count += filters.collections.length;
    count += filters.productTypes.length;
    count += filters.vendors.length;
    count += filters.tags.length;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.availability !== 'all') count++;
    return count;
  };

  const filtersOptions = (options: Array<{value: string; label: string}>, searchTerm: string) => {
    if (!searchTerm) return options;
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  useEffect(() => {
    const collections = searchParams.get('collections')?.split(',').filter(Boolean) || [];
    const productTypes = searchParams.get('product_types')?.split(',').filter(Boolean) || [];
    const vendors = searchParams.get('vendor')?.split(',').filter(Boolean) || [];
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const priceMin = searchParams.get('price_min') || '';
    const priceMax = searchParams.get('price_max') || '';
    const availability = (searchParams.get('availability') as State['availability']) || 'all';

    setFilters({
      collections, productTypes, vendors, tags,
      priceRange: { min: priceMin, max: priceMax },
      availability
    });
  }, [searchParams]);

  const FilterSection = ({ 
    title, 
    icon: Icon,
    sectionKey,
    options, 
    selectedValues, 
    filterKey,
    showSearch = false
  }: { 
    title: string;
    icon: React.ElementType;
    sectionKey: string;
    options: Array<{value: string; label: string}>; 
    selectedValues: string[]; 
    filterKey: 'collections' | 'productTypes' | 'vendors' | 'tags';
    showSearch?: boolean;
  }) => {
    const searchTerm = searchTerms[sectionKey] || '';
    const filteredOptions = filtersOptions(options, searchTerm);
    
    if (options.length === 0) return null;

    return (
      <Card className="border shadow-sm">
        <div 
          onClick={() => toggleSection(sectionKey)}
          className="w-full p-4 flex items-center justify-between hover transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">{title}</h3>
              {selectedValues.length > 0 && (
                <p className="text-sm text-gray-500">{selectedValues.length} seleccionado(s)</p>
              )}
            </div>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform ${
              openSections.includes(sectionKey) ? 'rotate-180' : ''
            }`} 
          />
        </div>
        
        {openSections.includes(sectionKey) && (
          <div className="px-4 pb-4 border-t pt-4">
            {showSearch && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={`Buscar ${title.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerms(prev => ({ ...prev, [sectionKey]: e.target.value }))}
                  className="pl-10 h-9"
                />
              </div>
            )}
            
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedValues.map(value => {
                  const option = options.find(opt => opt.value === value);
                  return (
                    <Badge 
                      key={value}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 pr-1 pl-3"
                    >
                      {option?.label}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFilter(filterKey, value);
                        }}
                        className="ml-2 hover:bg-blue-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
            
            <ScrollArea className="h-40">
              <div className="space-y-1 pr-2">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleOptionToggle(filterKey, option.value)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors text-sm flex justify-between items-center ${
                      selectedValues.includes(option.value)
                        ? 'bg-blue-50 border border-blue-200 font-medium'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <span>{option.label}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {filteredOptions.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No se encontraron opciones</p>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-lg h-[90vh] flex flex-col p-0 z-50"
        onClick={(e) => e.stopPropagation()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <FilterIcon className="w-5 h-5 text-blue-600" />
              </div>
              <span>Filtros</span>
              {getActiveFiltersCount() > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-3 bg-blue-600 text-white rounded-full px-2.5 py-0.5"
                >
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-1">
            Personaliza tu búsqueda con filtros avanzados
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoadingFilters ? (
            <FilterSkeleton />
          ) : (
            <div className="space-y-4">
              <FilterSection title="Colecciones" icon={Grid3X3} sectionKey="collections" options={collectionOptions} selectedValues={filters.collections} filterKey="collections" showSearch={collectionOptions.length > 5}/>
              <FilterSection title="Artistas" icon={User} sectionKey="artists" options={artistOptions} selectedValues={filters.vendors} filterKey="vendors" showSearch={artistOptions.length > 5} />
              <FilterSection title="Tipo de Obra" icon={Package} sectionKey="productTypes" options={productTypeOptions} selectedValues={filters.productTypes} filterKey="productTypes" showSearch={productTypeOptions.length > 5} />
              
              {/* Secciones de Tags Inteligentes - todas escriben en `filters.tags` */}
              <FilterSection title="Técnicas" icon={Palette} sectionKey="techniques" options={techniqueOptions} selectedValues={filters.tags} filterKey="tags" showSearch />
              <FilterSection title="Formatos" icon={Square} sectionKey="formats" options={formatOptions} selectedValues={filters.tags} filterKey="tags" showSearch />
              <FilterSection title="Año" icon={CalendarDays} sectionKey="years" options={yearOptions} selectedValues={filters.tags} filterKey="tags" showSearch />
              <FilterSection title="Ubicaciones" icon={MapPin} sectionKey="locations" options={locationOptions} selectedValues={filters.tags} filterKey="tags" showSearch />
              <FilterSection title="Otros Tags" icon={Tag} sectionKey="otherTags" options={otherTagOptions} selectedValues={filters.tags} filterKey="tags" showSearch />

              <Card className="border shadow-sm">
                <div onClick={() => toggleSection('price')} className="w-full p-4 flex items-center justify-between hover transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-4 h-4 text-green-600" /></div>
                    <div>
                      <h3 className="font-medium">Rango de precio</h3>
                      {(filters.priceRange.min || filters.priceRange.max) && (
                        <p className="text-sm text-gray-500">${filters.priceRange.min || '0'} - ${filters.priceRange.max || '∞'}</p>
                      )}
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openSections.includes('price') ? 'rotate-180' : ''}`} />
                </div>
                {openSections.includes('price') && (
                  <div className="px-4 pb-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="price-min" className="text-sm font-medium text-gray-700">Mínimo</Label>
                        <Input id="price-min" type="number" placeholder="$0" value={filters.priceRange.min} onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: e.target.value })} className="h-10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price-max" className="text-sm font-medium text-gray-700">Máximo</Label>
                        <Input id="price-max" type="number" placeholder="$9999" value={filters.priceRange.max} onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: e.target.value })} className="h-10" />
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="border shadow-sm">
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-4"><div className="p-2 bg-purple-100 rounded-lg"><Package className="w-4 h-4 text-purple-600" /></div><h3 className="font-medium">Disponibilidad</h3></div>
                  <RadioGroup value={filters.availability} onValueChange={(value) => handleFilterChange('availability', value as State['availability'])} className="space-y-2">
                    {availabilityOptions.map(option => {
                      const IconComponent = option.icon;
                      return (
                        <div key={option.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={option.value} id={`availability-${option.value}`} className="text-blue-600" />
                          <IconComponent className="w-4 h-4 text-gray-500" />
                          <Label htmlFor={`availability-${option.value}`} className="text-sm cursor-pointer flex-1 text-gray-700">{option.label}</Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              </Card>
            </div>
          )}
        </div>
        
        <div className="px-6 py-6 border-t flex-shrink-0">
          <div className="space-y-3">
            <Button onClick={applyFilters} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Aplicar filtros</Button>
            <Button onClick={clearFilters} variant="outline" className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-100 font-medium rounded-lg transition-colors">Limpiar filtros</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};