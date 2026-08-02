import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#f25c05]/10 text-[#f25c05]',
        secondary: 'bg-[#112237]/10 text-[#112237]',
        success: 'bg-[#10b981]/10 text-[#10b981]',
        destructive: 'bg-[#ef4444]/10 text-[#ef4444]',
        warning: 'bg-[#f59e0b]/10 text-[#f59e0b]',
        outline: 'border border-[#e2e8f0] text-[#64748b]',
        pro: 'bg-gradient-to-r from-[#f25c05] to-[#ff7b3a] text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };