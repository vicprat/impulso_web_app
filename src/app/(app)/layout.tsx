
import { DashboardSidebar } from '@/components/Navigation/DashboardSidebar';
import { Breadcrumbs } from '@/components/Navigation/Breadcrumbs';
import { Guard } from '@/components/Guards';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Guard.Route>
      <div className="flex h-screen">
        <aside className="w-64 border-r bg-background">
          <DashboardSidebar />
        </aside>
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </Guard.Route>
  );
}