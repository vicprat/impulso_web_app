'use client'

import { Search } from 'lucide-react'
import React, { type ReactNode } from 'react'

import { Input } from '@/components/ui/input'

interface Props {
  searchTerm: string
  onSearchChange: (value: string) => void
  placeholder?: string
  children?: ReactNode
}

export const Toolbar: React.FC<Props> = ({
  children,
  onSearchChange,
  placeholder = 'Buscar...',
  searchTerm,
}) => {
  return (
    <div className='flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0'>
      <div className='relative max-w-sm flex-1'>
        <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className='bg-card pl-10 shadow-elevation-1'
        />
      </div>
      {children}
    </div>
  )
}
