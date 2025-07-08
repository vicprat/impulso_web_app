'use client'

import { usePathname } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  return (
    <div className='min-h-screen'>
      <main className='w-full'>
        <Header.Public isHomePage={isHomePage} />

        {children}
      </main>
      <Footer />
    </div>
  )
}
