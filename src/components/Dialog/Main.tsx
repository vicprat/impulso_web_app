import { type LucideIcon } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void

  title: string
  description?: string
  children: React.ReactNode

  triggerText?: string
  triggerIcon?: LucideIcon
  triggerVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon'
  triggerClassName?: string

  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
  contentClassName?: string
}

export const Main: React.FC<Props> = ({
  children,
  contentClassName = '',
  description,
  maxWidth = '2xl',
  onOpenChange,
  open,
  title,
  triggerClassName = '',
  triggerIcon: TriggerIcon,
  triggerText,
  triggerVariant = 'default',
}) => {
  const getMaxWidthClass = (width: string) => {
    const widthMap = {
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
      lg: 'max-w-lg',
      md: 'max-w-md',
      sm: 'max-w-sm',
      xl: 'max-w-xl',
    }
    return widthMap[ width as keyof typeof widthMap ] || 'max-w-2xl'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {triggerText && (
          <Button
            variant={triggerVariant}
            className={`flex items-center gap-2 ${triggerClassName}`}
          >
            {TriggerIcon && <TriggerIcon className='size-4' />}
            {triggerText}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className={`${getMaxWidthClass(maxWidth)} max-h-[90vh] overflow-y-auto ${contentClassName}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
