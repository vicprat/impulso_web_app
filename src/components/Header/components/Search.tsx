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
} from '@/components/ui/command';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const Search: React.FC<Props> = ({ open, setOpen }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading, isError } = useProducts(
    { query: `title:*${debouncedQuery}*`, first: 5 },
    {
      enabled: !!debouncedQuery,
    }
  );

  const products = data?.products || [];

  const handleSelect = (handle: string) => {
    router.push(`/store/product/${handle}`);
    setOpen(false);
  };
  
  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Busca tus productos favoritos..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading && <div className='p-4 space-y-2'>
            <Skeleton className='h-8 w-full'/>
            <Skeleton className='h-8 w-full'/>
            <Skeleton className='h-8 w-full'/>
        </div>}
        
        {!isLoading && !isError && products.length === 0 && (
          <CommandEmpty>No se encontraron productos.</CommandEmpty>
        )}
        
        {isError && <CommandEmpty>Ocurrió un error al buscar.</CommandEmpty>}

        {products.length > 0 && (
          <CommandGroup heading="Productos">
            {products.map((product) => (
              <CommandItem
                key={product.id}
                value={product.title} 
                onSelect={() => handleSelect(product.handle)}
                className="flex items-center gap-4 cursor-pointer"
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
      </CommandList>
    </CommandDialog>
  );
}