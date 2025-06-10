'use client';

import { queryClient } from '@/lib/query-client';
import { QueryClientProvider as ReactQueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/modules/auth/context/useAuth';
import { UserManagementProvider } from '@/modules/user/context';


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryClientProvider client={queryClient}>
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <AuthProvider>
              <UserManagementProvider>

        {children}
              </UserManagementProvider>
      </AuthProvider>
        <Toaster position="top-right" closeButton richColors />
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </ThemeProvider>
  </ReactQueryClientProvider>
  );
}