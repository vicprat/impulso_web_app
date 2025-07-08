'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
export const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false)
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className='size-4' />
    if (theme === 'light') return <Sun className='size-4' />
    return <Monitor className='size-4' />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='size-8 px-0'>
          {getThemeIcon()}
          <span className='sr-only'>Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className='mr-2 size-4' />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className='mr-2 size-4' />
          <span>Oscuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className='mr-2 size-4' />
          <span>Sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
