'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';
import { Search } from './Search';

export function SearchTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  return (
    <>
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground"
          onClick={() => setOpen(true)}
        >
          <SearchIcon className="mr-2 h-4 w-4" />
          <span>Buscar productos...</span>
          <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>
      
      <div className="md:hidden">
         <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <SearchIcon className="h-5 w-5" />
          </Button>
      </div>

      <Search open={open} setOpen={setOpen} />
    </>
  );
}