'use client';
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Content = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('q', searchTerm.trim());
      router.push(`/store/search?${params.toString()}`);
    } else {
      router.push('/store');
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    const queryString = params.toString();
    router.push(queryString ? `/store/search?${queryString}` : '/store');
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md mx-auto">
      <div className={cn(
        "relative flex items-center",
        "bg-surface-container-high rounded-full",
        "border border-outline-variant/40",
        "transition-all duration-200 ease-out",
        "hover:shadow-md hover:border-outline/60",
        isFocused && "shadow-lg border-primary ring-2 ring-primary/20"
      )}>
        <div className="absolute left-4 flex items-center pointer-events-none">
          <SearchIcon className={cn(
            "h-5 w-5 transition-colors duration-200",
            isFocused ? "text-primary" : "text-on-surface-variant"
          )} />
        </div>
        
        <Input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "w-full h-14 pl-12 pr-12 text-base",
            "bg-transparent border-0 rounded-full",
            "text-on-surface placeholder:text-on-surface-variant",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "transition-all duration-200"
          )}
        />
        
        {searchTerm && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className={cn(
              "absolute right-2 h-10 w-10 rounded-full",
              "text-on-surface-variant hover:text-on-surface",
              "hover:bg-surface-container transition-all duration-200",
              "focus-visible:ring-2 focus-visible:ring-primary/20"
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Limpiar búsqueda</span>
          </Button>
        )}
      </div>
      
      {isFocused && searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container rounded-2xl shadow-lg border border-outline-variant/40 overflow-hidden z-50">
          <div className="p-4 text-sm text-on-surface-variant">
            Presiona Enter para buscar &quot;{searchTerm}&quot;
          </div>
        </div>
      )}
    </form>
  );
}