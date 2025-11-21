import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          'block w-full px-4 py-2.5 rounded-lg',
          'bg-white border-2 border-gray-300',
          'text-gray-900 placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy',
          'transition-all duration-200',
          'shadow-sm hover:border-gray-400',
          'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200',

          // Border states
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',

          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };