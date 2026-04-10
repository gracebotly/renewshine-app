'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-(--color-brand) text-(--color-brand-foreground) hover:bg-(--color-brand-hover) focus-visible:ring-(--color-brand)',
        outline:
          'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-400',
        ghost:
          'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400',
        danger:
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
        'brand-outline':
          'border border-(--color-brand) text-(--color-brand) bg-transparent hover:bg-(--color-brand-muted) focus-visible:ring-(--color-brand)',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
        xl: 'h-14 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
