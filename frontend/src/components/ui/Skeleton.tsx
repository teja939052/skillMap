import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', width, height, style, ...props }, ref) => {
    const variants = {
      text: 'h-4 rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
    };

    return (
      <div
        ref={ref}
        className={cn('animate-pulse bg-gray-200', variants[variant], className)}
        style={{ width, height, ...style }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';
export default Skeleton;
