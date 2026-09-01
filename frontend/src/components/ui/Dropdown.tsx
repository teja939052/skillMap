import { useState, useRef, useEffect, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export default function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[180px] bg-white rounded-lg border border-gray-200 shadow-lg py-1',
            'animate-in fade-in slide-in-from-top-2 duration-150',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: 'default' | 'danger';
  className?: string;
}

export function DropdownItem({ children, onClick, icon, variant = 'default', className }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors duration-150',
        variant === 'default' ? 'text-navy-700 hover:bg-gray-50' : 'text-red-600 hover:bg-red-50',
        className
      )}
    >
      {icon && <span className="h-4 w-4">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-gray-100" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return <div className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">{children}</div>;
}

export { ChevronDown };
