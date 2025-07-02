import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'hover:bg-primary/80 border-transparent bg-primary text-primary-foreground shadow',
        destructive:
          'hover:bg-destructive/80 border-transparent bg-destructive text-destructive-foreground shadow',
        active: 'border-transparent bg-success-container text-on-success-container shadow-sm',
        error: 'hover:bg-error/80 border-transparent bg-error text-on-error shadow',

        archived: 'border-transparent bg-error-container text-on-error-container shadow-sm',

        'error-container':
          'hover:bg-error-container/80 border-transparent bg-error-container text-on-error-container',

        available: 'border-transparent bg-success text-on-success shadow-sm',

        outline: 'border-outline text-foreground',

        draft: 'border-transparent bg-warning-container text-on-warning-container shadow-sm',

        'outline-error': 'hover:bg-error/10 border-error bg-transparent text-error',

        'outline-primary': 'hover:bg-primary/10 border-primary bg-transparent text-primary',

        'outline-success': 'hover:bg-success/10 border-success bg-transparent text-success',

        'outline-warning': 'hover:bg-warning/10 border-warning bg-transparent text-warning',

        'primary-container':
          'hover:bg-primary-container/80 border-transparent bg-primary-container text-on-primary-container',

        secondary:
          'hover:bg-secondary/80 border-transparent bg-secondary text-secondary-foreground',

        'secondary-container':
          'hover:bg-secondary-container/80 border-transparent bg-secondary-container text-on-secondary-container',

        success: 'hover:bg-success/80 border-transparent bg-success text-on-success shadow',

        'success-container':
          'hover:bg-success-container/80 border-transparent bg-success-container text-on-success-container',

        'surface-high':
          'border-transparent bg-surface-container-high text-on-surface hover:bg-surface-container-highest',

        'surface-variant':
          'border-transparent bg-surface-container text-on-surface hover:bg-surface-container-high',

        'tertiary-container':
          'bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-container/80 border-transparent',

        unavailable: 'border-transparent bg-error text-on-error shadow-sm',

        warning: 'hover:bg-warning/80 border-transparent bg-warning text-on-warning shadow',
        'warning-container':
          'hover:bg-warning-container/80 border-transparent bg-warning-container text-on-warning-container',
      },
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
