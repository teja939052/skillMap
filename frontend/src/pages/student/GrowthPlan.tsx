import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { BookOpen, Zap } from 'lucide-react';

export default function GrowthPlan() {
  const actions = [
    { type: 'course', title: 'Docker Fundamentals Bootcamp', duration: '4 weeks', impact: 'High', competency: 'Docker' },
    { type: 'project', title: 'Cloud Deployment Project', duration: '2 weeks', impact: 'High', competency: 'AWS' },
    { type: 'training', title: 'System Design Workshop', duration: '1 week', impact: 'Medium', competency: 'Architecture' },
    { type: 'assessment', title: 'Container Orchestration Assessment', duration: '1 hour', impact: 'Medium', competency: 'Kubernetes' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Growth Plan — WHAT SHOULD I DO?</h1>
        <p className="text-gray-500 mt-1">Recommended actions to close gaps → Did I improve? AWS 32→71 • 3 opportunities now, unlock 11 after Cloud Fundamentals</p>
      </div>

      <div className="space-y-3">
        {actions.map((action, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${action.type === 'course' ? 'bg-blue-100' : action.type === 'project' ? 'bg-green-100' : action.type === 'training' ? 'bg-purple-100' : 'bg-amber-100'}`}>
                  {action.type === 'course' ? <BookOpen className="w-5 h-5 text-blue-600" /> : <Zap className="w-5 h-5 text-green-600" />}
                </div>
                <div>
                  <h3 className="font-medium text-navy-900">{action.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{action.duration}</span>
                    <Badge variant="outline" size="sm">{action.competency}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={action.impact === 'High' ? 'success' : 'default'}>{action.impact} Impact</Badge>
                <Button size="sm">Start</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
