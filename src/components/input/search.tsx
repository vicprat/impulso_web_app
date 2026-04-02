import { RefreshCw, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  placeholder?: string
  initialValue?: string
  onSearch: (value: string) => void
  isLoading?: boolean
  className?: string
  onChange?: (value: string) => void
}

export function SearchInput({
  className,
  initialValue = '',
  isLoading = false,
  onChange,
  onSearch,
  placeholder = 'Buscar...',
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(initialValue)

  useEffect(() => {
    if (initialValue !== internalValue) {
      setInternalValue(initialValue)
    }
  }, [initialValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value)
    onChange?.(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearch(internalValue)
    }
  }

  const handleSearchClick = () => {
    onSearch(internalValue)
  }

  return (
    <div className={cn('relative flex max-w-sm flex-1', className)}>
      <Input
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className='rounded-r-none'
        disabled={isLoading}
      />
      <Button
        type='button'
        onClick={handleSearchClick}
        className='rounded-l-none px-3'
        variant='default'
        disabled={isLoading}
      >
        {isLoading ? <RefreshCw className='size-4 animate-spin' /> : <Search className='size-4' />}
      </Button>
    </div>
  )
}
