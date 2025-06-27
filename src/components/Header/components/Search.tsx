'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { useProducts } from '@/modules/shopify/hooks';
import { useDebounce } from '@/hooks/use-debounce';

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { Skeleton } from '@/components/ui/skeleton';
import { Search as SearchIcon } from 'lucide-react';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const Search: React.FC<Props> = ({ open, setOpen }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

 const { data, isLoading, isError } = useProducts(
    { 
      filters: {
        query: `(title:*${debouncedQuery}*) OR (product_type:*${debouncedQuery}*) OR (tag:*${debouncedQuery}*)`
      },
      first: 5
    },
    {
      enabled: !!debouncedQuery,
    }
  );

  const products = data?.products || [];

  const handleSelect = (handle: string) => {
    router.push(`/store/product/${handle}`);
    setOpen(false);
  };

  const handleSeeMore = () => {
    if (!debouncedQuery) return;
    router.push(`/store/search?q=${debouncedQuery}`);
    setOpen(false);
  }
  
  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Busca por obra, artista, estilo o técnica..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading && <div className='p-4 space-y-2'>
            <Skeleton className='h-8 w-full'/>
            <Skeleton className='h-8 w-full'/>
            <Skeleton className='h-8 w-full'/>
        </div>}
        
        {!isLoading && !isError && products.length === 0 && debouncedQuery && (
          <CommandEmpty>No se encontraron obras.</CommandEmpty>
        )}
        
        {isError && <CommandEmpty>Ocurrió un error al buscar.</CommandEmpty>}

        {/* Grupo de productos */}
        {products.length > 0 && !isLoading && (
          <CommandGroup heading="Obras">
            {products.map((product) => (
              <CommandItem
                key={product.id}
                value={product.title} 
                onSelect={() => handleSelect(product.handle)}
                className="flex items-center gap-4 cursor-pointer my-2"
              >
                <div className="relative w-10 h-10 rounded-md overflow-hidden">
                  <Image
                    src={product.images[0]?.url || '/placeholder.svg'}
                    alt={product.title}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{product.title}</span>
                  <span className="text-sm text-muted-foreground">
                    ${product.priceRange.minVariantPrice.amount} {product.priceRange.minVariantPrice.currencyCode}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {products.length > 0 && !isLoading && debouncedQuery && (
          <>
            <CommandSeparator />
            <CommandGroup>
                <CommandItem
                    value={`ver-todos-los-resultados-para-${debouncedQuery}`}
                    onSelect={handleSeeMore}
                    className="flex items-center gap-2 cursor-pointer text-primary"
                >
                    <SearchIcon className="w-4 h-4" />
                    <span>Ver todos los resultados para &quot;{debouncedQuery}&quot;</span>
                </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}