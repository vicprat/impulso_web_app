'use client'
import { Search as SearchIcon, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export const Content = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setSearchTerm(q)
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('q', searchTerm.trim())
      router.push(`/store/search?${params.toString()}`)
    } else {
      router.push('/store')
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    const queryString = params.toString()
    router.push(queryString ? `/store/search?${queryString}` : '/store')
  }

  return (
    <form onSubmit={handleSearch} className='relative mx-auto w-full max-w-md'>
      <div
        className={cn(
          'relative flex items-center',
          'bg-surface-container-high rounded-full',
          'border-outline-variant/40 border',
          'transition-all duration-200 ease-out',
          'hover:border-outline/60 hover:shadow-md',
          isFocused && 'border-primary shadow-lg ring-2 ring-primary/20'
        )}
      >
        <div className='pointer-events-none absolute left-4 flex items-center'>
          <SearchIcon
            className={cn(
              'size-5 transition-colors duration-200',
              isFocused ? 'text-primary' : 'text-on-surface-variant'
            )}
          />
        </div>

        <Input
          type='text'
          placeholder='Buscar productos...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'h-14 w-full px-12 text-base',
            'rounded-full border-0 bg-transparent',
            'text-on-surface placeholder:text-on-surface-variant',
            'focus-visible:ring-0 focus-visible:ring-offset-0',
            'transition-all duration-200'
          )}
        />

        {searchTerm && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={clearSearch}
            className={cn(
              'absolute right-2 size-10 rounded-full',
              'text-on-surface-variant hover:text-on-surface',
              'hover:bg-surface-container transition-all duration-200',
              'focus-visible:ring-2 focus-visible:ring-primary/20'
            )}
          >
            <X className='size-4' />
            <span className='sr-only'>Limpiar búsqueda</span>
          </Button>
        )}
      </div>

      {isFocused && searchTerm && (
        <div className='bg-surface-container border-outline-variant/40 absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border shadow-lg'>
          <div className='text-on-surface-variant p-4 text-sm'>
            Presiona Enter para buscar &quot;{searchTerm}&quot;
          </div>
        </div>
      )}
    </form>
  )
}
