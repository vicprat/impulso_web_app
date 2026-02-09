'use client'

import { QueryClientProvider as ReactQueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

import { ShopifyAnalytics } from '@/components/ShopifyAnalytics'
import { queryClient } from '@/lib/query-client'
import { AuthProvider } from '@/modules/auth/context/useAuth'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryClientProvider client={queryClient}>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <AuthProvider>{children}</AuthProvider>
        <ShopifyAnalytics />
        <Toaster position='top-right' closeButton richColors />
        {/* {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />} */}
      </ThemeProvider>
    </ReactQueryClientProvider>
  )
}
