'use client';

import Link from 'next/link';
import { Logo } from './components/Logo';
import { SearchTrigger } from './components/SearchTrigger'; 
import { ThemeSwitch } from './components/ThemeSwitch';
import { UserMenu } from './components/UserMenu';
import { MiniCart } from '@/components/Cart/MiniCart';
import {PublicStoreRoutes} from '@/config/routes'

export function Public() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Logo />
          </div>

          <div className="flex-1">
            <nav className="hidden md:flex items-center justify-center">
              {PublicStoreRoutes.map((route) => (
                <Link
                  key={route.label}
                  href={route.path}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2"
                >
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>


          <div className="flex items-center gap-2">
          <SearchTrigger />
            <MiniCart />
            <UserMenu />
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </header>
  );
}