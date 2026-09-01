import Card, { CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { ProgressBar } from '@/components/ui';
import { proficiencyLabel, proficiencyColor } from '@/utils/format';
import type { CompetencyResponse } from '@/types';

interface CompetencyCardProps {
  competency: CompetencyResponse;
  proficiencyLevel?: number;
  onClick?: () => void;
}

export default function CompetencyCard({ competency, proficiencyLevel = 0, onClick }: CompetencyCardProps) {
  const colorClass = proficiencyColor(proficiencyLevel);

  return (
    <Card hover={!!onClick} className={onClick ? 'cursor-pointer' : ''} onClick={onClick}>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-semibold text-navy-900 truncate">{competency.name}</h4>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">{competency.type}</p>
          </div>
          <Badge variant="outline" size="sm">{competency.domain ?? 'General'}</Badge>
        </div>

        {competency.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{competency.description}</p>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Proficiency</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
              {proficiencyLabel(proficiencyLevel)}
            </span>
          </div>
          <ProgressBar value={proficiencyLevel} max={5} size="sm" />
        </div>

        {competency.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {competency.keywords.slice(0, 3).map((kw: string) => (
              <Badge key={kw} variant="default" size="sm">{kw}</Badge>
            ))}
            {competency.keywords.length > 3 && (
              <Badge variant="outline" size="sm">+{competency.keywords.length - 3}</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
