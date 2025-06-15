'use client';

import { useCurrentUser } from '@/modules/user/hooks/management';
import { Skeleton } from '@/components/ui/skeleton';
import { MiniCart } from '@/components/Cart/MiniCart'; 
import { SearchTrigger } from './components/SearchTrigger';
import { Breadcrumbs } from '../Navigation/Breadcrumbs';
import { ThemeSwitch } from './components/ThemeSwitch';
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from '../ui/button';
import {  PanelLeft } from 'lucide-react';

const AuthenticatedSkeleton = () => (
  <div className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);



export const Authenticated = () => {
  const { currentUser, isLoading: userLoading } = useCurrentUser();
  
  const { toggleSidebar } = useSidebar()

  if (userLoading) {
    return <AuthenticatedSkeleton />;
  }

  if (!currentUser) {
    return null;
  }
  
  return (
    <div className="shadow-sm ">
      <div className=" mx-auto px-4">
       
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold">
             <Button onClick={toggleSidebar} variant="ghost">
           <PanelLeft />
              </Button>
              Bienvenido, {currentUser.firstName || currentUser.email}
            </h1>
           
          </div>
                    <SearchTrigger />
          
          <div className="flex items-center space-x-2">
            <MiniCart />
             <ThemeSwitch />
          </div>
        </div>
      </div>
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-2">

                <Breadcrumbs />
      </div>
    </div>
  );
}