'use client';

import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  className?: string;
}

export default function Select({ children, className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full px-4 py-2.5 rounded-lg bg-white border-2 border-gray-300 text-gray-900',
        'focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy',
        'transition-all duration-200 shadow-sm hover:border-gray-400',
        'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

// Named export for consistency
export { Select };
