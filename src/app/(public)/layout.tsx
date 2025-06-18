'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <div className="min-h-screen bg-surface">
      <main className="w-full">
        <Header.Public isHomePage={isHomePage} />
        
        {children}
      </main>
      <Footer />
    </div>
  );
}