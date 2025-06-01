import Link from 'next/link';
import { Search } from '@/components/Search';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export const Store = () => {
  return (
   <header className="sticky top-0 z-50 w-full bg-white ">
 
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <Link 
            href="/" 
            className="text-2xl font-bold text-primary flex-shrink-0 hover:text-primary/80 transition-colors duration-200"
          >
            Mi Tienda
          </Link>
          
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <Search />
          </div>
          
          <nav className="hidden lg:flex items-center space-x-2 flex-shrink-0">
            <Button variant="ghost" size="sm" asChild className="text-on-surface hover:bg-surface-container-high">
              <Link href="/store">
                Tienda
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-on-surface hover:bg-surface-container-high">
              <Link href="/store/collections">
                Colecciones
              </Link>
            </Button>
          </nav>
          
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-on-surface">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-surface-container">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="md:hidden mb-6">
                    <Search />
                  </div>
                  
                  <Button variant="ghost" size="lg" asChild className="justify-start text-on-surface hover:bg-surface-container-high">
                    <Link href="/store">
                      Tienda
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg" asChild className="justify-start text-on-surface hover:bg-surface-container-high">
                    <Link href="/store/collections">
                      Colecciones
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}