import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/format';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, name, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
    };

    if (src) {
      return (
        <div
          ref={ref}
          className={cn('relative rounded-full overflow-hidden flex-shrink-0', sizes[size], className)}
          {...props}
        >
          <img src={src} alt={name} className="h-full w-full object-cover" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-full bg-navy-100 text-navy-700 flex items-center justify-center font-medium flex-shrink-0',
          sizes[size],
          className
        )}
        {...props}
      >
        {getInitials(name)}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
export default Avatar;
