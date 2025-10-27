'use client'

import { Search } from 'lucide-react'
import React, { type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  searchTerm: string
  onSearchChange: (value: string) => void
  placeholder?: string
  children?: ReactNode
  onSubmit?: () => void
}

export const Toolbar: React.FC<Props> = ({
  children,
  onSearchChange,
  onSubmit,
  placeholder = 'Buscar...',
  searchTerm,
}) => {
  return (
    <form
      className='flex flex-col space-y-3 px-4 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0'
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.()
      }}
    >
      <div className='relative flex max-w-sm flex-1'>
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onSubmit?.()
            }
          }}
          className='rounded-r-none bg-card pl-10 shadow-elevation-1'
        />
        <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
      </div>
      <Button type='submit' className='rounded-l-none px-3' variant='default'>
        <Search className='size-4' />
      </Button>
      {children}
    </form>
  )
}
