import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { Users, Calendar } from 'lucide-react';

export default function Projects() {
  const projects = [
    { title: 'Cloud Migration Strategy', company: 'TechCorp', status: 'active', team: 4, deadline: '2024-03-15' },
    { title: 'ML Pipeline Optimization', company: 'DataFlow', status: 'active', team: 3, deadline: '2024-04-01' },
    { title: 'API Gateway Redesign', company: 'CloudScale', status: 'completed', team: 5, deadline: '2024-01-30' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Industry Projects</h1>
          <p className="text-gray-500 mt-1">Real-world projects for students</p>
        </div>
        <Button size="sm">Post Project</Button>
      </div>

      <div className="space-y-3">
        {projects.map((p, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-navy-900">{p.title}</h3>
                  <Badge variant={p.status === 'active' ? 'success' : 'default'}>{p.status}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{p.company}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{p.team} members</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.deadline}</span>
                </div>
              </div>
              <Button size="sm" variant="outline">View</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
