'use client'

import { Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const ArtistTypeFilter = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentType = searchParams.get('type') || 'all'

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (type === 'all') {
      params.delete('type')
    } else {
      params.set('type', type)
    }

    router.push(`/artists?${params.toString()}`, { scroll: false })
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'impulso':
        return 'Impulso'
      case 'collective':
        return 'Collective'
      default:
        return 'Todos los tipos'
    }
  }

  return (
    <div className='flex items-center gap-2'>
      <Filter className='size-4 text-muted-foreground' />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' className='min-w-[160px] justify-between'>
            {getTypeLabel(currentType)}
            <svg className='ml-2 size-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='w-48'>
          <DropdownMenuItem
            onClick={() => handleTypeChange('all')}
            className={
              currentType === 'all' ? 'bg-primary-container text-on-primary-container' : ''
            }
          >
            Todos los tipos
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleTypeChange('impulso')}
            className={
              currentType === 'impulso' ? 'bg-primary-container text-on-primary-container' : ''
            }
          >
            Impulso
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleTypeChange('collective')}
            className={
              currentType === 'collective' ? 'bg-primary-container text-on-primary-container' : ''
            }
          >
            Collective
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
