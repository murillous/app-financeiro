import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[var(--accent)] text-white',
        secondary: 'border-transparent bg-[var(--surface-hover)] text-[var(--text-primary)]',
        destructive: 'border-transparent bg-[var(--destructive)] text-white',
        success: 'border-transparent bg-[var(--success)] text-white',
        warning: 'border-transparent bg-[var(--warning)] text-white',
        outline: 'border-[var(--border)] text-[var(--text-primary)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
