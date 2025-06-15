import { Navigation } from '@/components/Navigation';
import { Filter } from '@/components/Filter';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Header } from '@/components/Header';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <SidebarProvider
        defaultOpen={false}
       >
        <Filter />
        
        <main className="w-full">
          <Header.Store />
          
          <Navigation.Store /> 
          
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}