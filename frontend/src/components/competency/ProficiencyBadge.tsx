import { cn } from '@/utils/cn';
import { proficiencyLabel, proficiencyColor } from '@/utils/format';

interface ProficiencyBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function ProficiencyBadge({ level, size = 'md', showLabel = true, className }: ProficiencyBadgeProps) {
  const colorClass = proficiencyColor(level);

  const sizes = {
    sm: 'h-5 w-5 text-xs',
    md: 'h-7 w-7 text-sm',
    lg: 'h-9 w-9 text-base',
  };

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-bold',
          sizes[size],
          colorClass
        )}
      >
        {level}
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium', colorClass.split(' ')[1])}>
          {proficiencyLabel(level)}
        </span>
      )}
    </div>
  );
}
