import { Card } from '@/components/ui';
import { ArrowRight } from 'lucide-react';

export default function GapMapPage() {
  const gaps = [
    { competency: 'Docker & Containerization', current: 2, target: 4, gap: 2, priority: 'high' },
    { competency: 'AWS Cloud Services', current: 2, target: 4, gap: 2, priority: 'high' },
    { competency: 'System Design', current: 1, target: 3, gap: 2, priority: 'medium' },
    { competency: 'CI/CD Pipelines', current: 1, target: 3, gap: 2, priority: 'medium' },
    { competency: 'Kubernetes', current: 0, target: 3, gap: 3, priority: 'low' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Skill Gap Map — WHAT AM I MISSING?</h1>
        <p className="text-gray-500 mt-1">Where you stand vs industry requirements • gaps → recommended actions → 3 now, 11 after Cloud Fundamentals</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {gaps.map((item) => (
            <div key={item.competency} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-navy-900">{item.competency}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    item.priority === 'high' ? 'bg-red-100 text-red-700' :
                    item.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{item.priority}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-navy-900 h-2 rounded-full" style={{ width: `${(item.current / 5) * 100}%` }} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: `${(item.target / 5) * 100}%` }} />
                  </div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Level {item.current}</span>
                  <span>Target: Level {item.target}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
