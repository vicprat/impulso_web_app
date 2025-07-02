'use client'

import { type LucideIcon } from 'lucide-react'
import React from 'react'

import { Main } from './Main'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode

  triggerText: string
  triggerIcon?: LucideIcon
  triggerVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon'
  triggerClassName?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
  contentClassName?: string
}

export const Form: React.FC<Props> = ({
  children,
  contentClassName,
  description,
  maxWidth = '2xl',
  onOpenChange,
  open,
  title,
  triggerClassName,
  triggerIcon,
  triggerSize = 'sm',
  triggerText,
  triggerVariant = 'default',
}) => {
  return (
    <Main
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      triggerText={triggerText}
      triggerIcon={triggerIcon}
      triggerVariant={triggerVariant}
      triggerSize={triggerSize}
      triggerClassName={triggerClassName}
      maxWidth={maxWidth}
      contentClassName={contentClassName}
    >
      {children}
    </Main>
  )
}
