'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { SearchTrigger } from './components/SearchTrigger';
import { ThemeSwitch } from './components/ThemeSwitch';
import { UserMenu } from './components/UserMenu';
import { MiniCart } from '@/components/Cart/MiniCart';
import { PublicStoreRoutes } from '@/config/routes';

interface PublicHeaderProps {
  isHomePage?: boolean;
}

export function Public({ isHomePage = false }: PublicHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [sphere1Pos, setSphere1Pos] = useState({ x: 15, y: 20 });
  const [sphere2Pos, setSphere2Pos] = useState({ x: 85, y: 70 });
  const [sphere3Pos, setSphere3Pos] = useState({ x: 60, y: 15 });

  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getRandomMenuPosition = (currentPos: { x: number; y: number }) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 30;
    
    let newX = currentPos.x + Math.cos(angle) * distance;
    let newY = currentPos.y + Math.sin(angle) * distance;
    
    newX = Math.max(10, Math.min(90, newX));
    newY = Math.max(10, Math.min(90, newY));
    
    return { x: newX, y: newY };
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    
    const interval1 = setInterval(() => {
      setSphere1Pos(prev => getRandomMenuPosition(prev));
    }, 6000);
    
    const interval2 = setInterval(() => {
      setSphere2Pos(prev => getRandomMenuPosition(prev));
    }, 8000);
    
    const interval3 = setInterval(() => {
      setSphere3Pos(prev => getRandomMenuPosition(prev));
    }, 7000);

    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
      clearInterval(interval3);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const shouldShowHeader = !isHomePage || isScrolled;

  return (
    <>
      <header 
        className={`${isHomePage ? 'fixed' : 'sticky'} top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ease-in-out ${
          shouldShowHeader ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
           
              
              <div className="h-6 sm:h-10 lg:h-12 max-w-48 lg:mt-2 px-2">
                <Logo />
              </div>
            </div>

     
                <SearchTrigger />

            <div className="flex items-center gap-1 sm:gap-2">
              <div className="hidden sm:block">
              </div>
              <MiniCart />
              <div className="hidden sm:block">
                <UserMenu />
              </div>
              <ThemeSwitch />
              
              <div className="sm:hidden">
                <SearchTrigger />
              </div>
                 {/* Botón de menú ahora visible en todos los dispositivos */}
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring transition-colors relative z-50"
                aria-label="Toggle menu"
              >
                <div className="relative w-5 h-5">
                  <Menu 
                    className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'
                    }`} 
                  />
                  <X 
                    className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-180 scale-0'
                    }`} 
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu desplegable ahora disponible en todos los dispositivos */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out ${
          isMobileMenuOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible'
        }`}
      >
        <div className="absolute inset-0 bg-background/98 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/10 to-background"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-primary/5 via-transparent to-secondary/5"></div>
          
          {/* Esferas animadas - ajustadas para desktop */}
          <div 
            className="absolute w-64 md:w-80 lg:w-96 xl:w-[28rem] h-64 md:h-80 lg:h-96 xl:h-[28rem] bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-3xl opacity-40"
            style={{ 
              left: `${sphere1Pos.x}%`, 
              top: `${sphere1Pos.y}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'all 6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          ></div>
          
          <div 
            className="absolute w-48 md:w-60 lg:w-72 xl:w-80 h-48 md:h-60 lg:h-72 xl:h-80 bg-gradient-to-bl from-accent/30 to-muted/20 rounded-full blur-2xl opacity-30"
            style={{ 
              left: `${sphere2Pos.x}%`, 
              top: `${sphere2Pos.y}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'all 8s cubic-bezier(0.4, 0.0, 0.2, 1)',
            }}
          ></div>
          
          <div 
            className="absolute w-32 md:w-40 lg:w-48 xl:w-56 h-32 md:h-40 lg:h-48 xl:h-56 bg-gradient-to-tr from-muted-foreground/10 to-primary/15 rounded-full blur-xl opacity-50"
            style={{ 
              left: `${sphere3Pos.x}%`, 
              top: `${sphere3Pos.y}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'all 7s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          ></div>
        </div>

        <div className="relative h-full flex flex-col">
          <div className="h-14 sm:h-16"></div>
          
          <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 xl:px-32 py-8">
            <nav className="space-y-1">
              {PublicStoreRoutes.map((route, index) => (
                <div
                  key={route.label}
                  className={`transform transition-all duration-700 ease-out ${
                    isMobileMenuOpen
                      ? 'translate-x-0 opacity-100'
                      : 'translate-x-8 opacity-0'
                  }`}
                  style={{ 
                    transitionDelay: `${isMobileMenuOpen ? index * 100 + 200 : 0}ms` 
                  }}
                >
                  <Link
                    href={route.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground hover:text-primary py-3 lg:py-4 xl:py-6 transition-all duration-300 hover:translate-x-4 hover:scale-105 tracking-tight"
                  >
                    {route.label}
                  </Link>
                </div>
              ))}
            </nav>
          </div>
          
          <div 
            className={`px-8 md:px-16 lg:px-24 xl:px-32 pb-12 transform transition-all duration-700 ease-out ${
              isMobileMenuOpen
                ? 'translate-y-0 opacity-100'
                : 'translate-y-8 opacity-0'
            }`}
            style={{ 
              transitionDelay: `${isMobileMenuOpen ? PublicStoreRoutes.length * 100 + 400 : 0}ms` 
            }}
          >
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8"></div>
            
            <div className="space-y-4">
              <h3 className="text-lg lg:text-xl font-semibold text-muted-foreground uppercase tracking-wider">
                Cuenta
              </h3>
              <UserMenu />
            </div>
            
            <div className="mt-8 pt-8 border-t border-border/50">
              <p className="text-sm lg:text-base text-muted-foreground">
                © {new Date().getFullYear()} Impulso Galería
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}