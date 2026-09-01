import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { Calendar, Users } from 'lucide-react';

export default function Interventions() {
  const interventions = [
    { title: 'Docker Bootcamp', type: 'Training', status: 'active', enrolled: 45, capacity: 60, startDate: '2024-02-01' },
    { title: 'AWS Cloud Workshop', type: 'Workshop', status: 'active', enrolled: 30, capacity: 40, startDate: '2024-02-15' },
    { title: 'Industry Project: Cloud Migration', type: 'Project', status: 'draft', enrolled: 0, capacity: 20, startDate: '2024-03-01' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Interventions</h1>
          <p className="text-gray-500 mt-1">Training, workshops, and projects</p>
        </div>
        <Button size="sm">Create Intervention</Button>
      </div>

      <div className="space-y-3">
        {interventions.map((item, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-navy-900">{item.title}</h3>
                  <Badge variant={item.status === 'active' ? 'success' : 'default'}>{item.status}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{item.enrolled}/{item.capacity}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.startDate}</span>
                  <Badge variant="outline" size="sm">{item.type}</Badge>
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
