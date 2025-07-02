import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 px-4 py-2',
        icon: 'size-9',
        lg: 'h-10 rounded-md px-8',
        sm: 'h-8 rounded-md px-3 text-xs',
      },
      variant: {
        'container-destructive':
          'hover:bg-error-container/80 bg-error-container text-on-error-container shadow-sm',

        'container-success':
          'hover:bg-success-container/80 bg-success-container text-on-success-container shadow-sm',

        'container-warning':
          'hover:bg-warning-container/80 bg-warning-container text-on-warning-container shadow-sm',

        default: 'hover:bg-primary/90 bg-primary text-primary-foreground shadow',

        destructive: 'hover:bg-destructive/90 bg-destructive text-destructive-foreground shadow-sm',

        ghost: 'hover:bg-accent hover:text-accent-foreground',

        'ghost-destructive': 'hover:bg-destructive/10 text-destructive hover:text-destructive',

        'ghost-success': 'hover:bg-success/10 text-success hover:text-success',

        'ghost-warning': 'hover:bg-warning/10 text-warning hover:text-warning',

        link: 'text-primary underline-offset-4 hover:underline',

        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',

        'outline-destructive':
          'border border-destructive bg-background text-destructive shadow-sm hover:bg-destructive hover:text-destructive-foreground',

        'outline-success':
          'border border-success bg-background text-success shadow-sm hover:bg-success hover:text-on-success',

        'outline-warning':
          'border border-warning bg-background text-warning shadow-sm hover:bg-warning hover:text-on-warning',

        secondary: 'hover:bg-secondary/80 bg-secondary text-secondary-foreground shadow-sm',

        success: 'hover:bg-success/90 bg-success text-on-success shadow-sm',

        warning: 'hover:bg-warning/90 bg-warning text-on-warning shadow-sm',
      },
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ className, size, variant }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
