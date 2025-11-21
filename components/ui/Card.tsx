import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    return (
      <div
        className={cn(
          // Base styles
          'rounded-lg transition-all',

          // Padding variants
          {
            'p-4': padding === 'sm',
            'p-6': padding === 'md',
            'p-8': padding === 'lg',
            'p-0': padding === 'none',
          },

          // Style variants
          {
            // Default - Clean white with subtle border and shadow
            'bg-white border border-gray-200 shadow-sm hover:shadow-md':
              variant === 'default',

            // Bordered - Emphasis on border
            'bg-white border-2 border-gray-300 hover:border-brand-navy/50':
              variant === 'bordered',

            // Elevated - With prominent shadow
            'bg-white border border-gray-100 shadow-lg hover:shadow-xl':
              variant === 'elevated',
          },

          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };