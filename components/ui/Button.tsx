import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2',

          // Size variants
          {
            'px-4 py-2 text-sm': size === 'sm',
            'px-6 py-2.5 text-base': size === 'md',
            'px-8 py-3 text-lg': size === 'lg',
          },

          // Style variants
          {
            // Primary - Brand Navy with shadow
            'bg-brand-navy hover:bg-brand-darkNavy text-white shadow-sm hover:shadow-md focus:ring-brand-navy':
              variant === 'primary',

            // Secondary - Light with border
            'bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 shadow-sm focus:ring-gray-400':
              variant === 'secondary',

            // Ghost - Minimal
            'hover:bg-gray-100 text-gray-700 focus:ring-gray-300':
              variant === 'ghost',

            // Danger - Red with shadow
            'bg-brand-red hover:bg-red-600 text-white shadow-sm hover:shadow-md focus:ring-red-500':
              variant === 'danger',
          },

          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };