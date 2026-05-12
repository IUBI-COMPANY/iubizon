import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[#f25c05] text-white hover:bg-[#d94d04] active:scale-[0.98]',
        primary:
          'bg-[#f25c05] text-white hover:bg-[#d94d04] active:scale-[0.98]',
        secondary:
          'bg-[#112237] text-white hover:bg-[#1a3652] active:scale-[0.98]',
        outline:
          'border-2 border-[#f25c05] text-[#f25c05] hover:bg-[#f25c05] hover:text-white',
        ghost:
          'hover:bg-[#f8fafc] text-[#112237]',
        link: 'text-[#f25c05] underline-offset-4 hover:underline',
        destructive:
          'bg-[#ef4444] text-white hover:bg-[#dc2626]',
        success:
          'bg-[#10b981] text-white hover:bg-[#059669]',
        tertiary:
          'bg-[#112237] text-white hover:bg-[#1a3652]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 rounded-lg px-8 text-base',
        xl: 'h-14 rounded-lg px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  styleVariant?: string;
  block?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, block, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          block && 'w-full'
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };