'use client'

import React, { type ReactNode } from 'react'

import { SearchInput } from '@/components/input/search'

interface Props {
  searchTerm: string
  onSearchChange: (value: string) => void
  placeholder?: string
  children?: ReactNode
  onSubmit?: () => void
  isLoading?: boolean
}

export const Toolbar: React.FC<Props> = ({
  children,
  isLoading,
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
      <SearchInput
        placeholder={placeholder}
        initialValue={searchTerm}
        onChange={onSearchChange}
        onSearch={() => onSubmit?.()}
        isLoading={isLoading}
      />
      {children}
    </form>
  )
}
