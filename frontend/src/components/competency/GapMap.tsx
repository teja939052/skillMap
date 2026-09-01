import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui';
import { Badge } from '@/components/ui';
import { ArrowUp, ArrowDown, Minus, AlertTriangle } from 'lucide-react';

interface GapItem {
  competencyId: string;
  competencyName: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
}

interface GapMapProps {
  gaps: GapItem[];
}

function getPriorityVariant(priority: string) {
  switch (priority) {
    case 'high': return 'danger';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'default';
  }
}

function getGapIcon(gap: number) {
  if (gap >= 2) return <ArrowDown className="h-4 w-4 text-red-500" />;
  if (gap >= 1) return <Minus className="h-4 w-4 text-amber-500" />;
  return <ArrowUp className="h-4 w-4 text-emerald-500" />;
}

export default function GapMap({ gaps }: GapMapProps) {
  const sortedGaps = [...gaps].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const highPriority = gaps.filter((g) => g.priority === 'high').length;
  const mediumPriority = gaps.filter((g) => g.priority === 'medium').length;
  const avgGap = gaps.length > 0
    ? Math.round((gaps.reduce((sum, g) => sum + g.gap, 0) / gaps.length) * 10) / 10
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-navy-900">{highPriority}</p>
              <p className="text-xs text-gray-500">High Priority Gaps</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Minus className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-navy-900">{mediumPriority}</p>
              <p className="text-xs text-gray-500">Medium Priority</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <ArrowDown className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-navy-900">{avgGap}</p>
              <p className="text-xs text-gray-500">Average Gap</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Skill Gap Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedGaps.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No gaps identified. Great work!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedGaps.map((gap) => (
                <div
                  key={gap.competencyId}
                  className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getGapIcon(gap.gap)}
                      <h4 className="font-medium text-navy-900 text-sm">{gap.competencyName}</h4>
                    </div>
                    <Badge variant={getPriorityVariant(gap.priority)} size="sm">
                      {gap.priority}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Current Level</p>
                      <ProgressBar value={gap.currentLevel} max={5} size="sm" />
                      <p className="text-xs font-medium text-navy-700 mt-1">Level {gap.currentLevel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Target Level</p>
                      <ProgressBar value={gap.targetLevel} max={5} size="sm" variant="success" />
                      <p className="text-xs font-medium text-navy-700 mt-1">Level {gap.targetLevel}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
