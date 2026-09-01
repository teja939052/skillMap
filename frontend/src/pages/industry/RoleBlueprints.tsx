import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';

export default function RoleBlueprints() {
  const blueprints = [
    { title: 'Backend Engineer', requirements: 8, candidates: 24, status: 'active' },
    { title: 'Frontend Developer', requirements: 6, candidates: 18, status: 'active' },
    { title: 'DevOps Engineer', requirements: 7, candidates: 12, status: 'active' },
    { title: 'Data Scientist', requirements: 9, candidates: 8, status: 'draft' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Role Blueprints</h1>
          <p className="text-gray-500 mt-1">Define competency requirements for roles</p>
        </div>
        <Button size="sm">Create Blueprint</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blueprints.map((bp) => (
          <Card key={bp.title} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-navy-900">{bp.title}</h3>
              <Badge variant={bp.status === 'active' ? 'success' : 'default'}>{bp.status}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{bp.requirements} requirements</span>
              <span>{bp.candidates} matched candidates</span>
            </div>
            <Button size="sm" variant="outline" className="mt-4 w-full">View Details</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
