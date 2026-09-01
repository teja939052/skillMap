import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';

export default function Applications() {
  const applications = [
    { title: 'Backend Engineering Intern', company: 'TechCorp', status: 'interview', date: '2024-01-15' },
    { title: 'Full Stack Developer', company: 'StartupXYZ', status: 'under_review', date: '2024-01-18' },
    { title: 'Data Analyst', company: 'DataMinds', status: 'accepted', date: '2024-01-10' },
    { title: 'QA Engineer', company: 'QualityFirst', status: 'rejected', date: '2024-01-05' },
  ];

  const statusVariant: Record<string, string> = {
    submitted: 'bg-gray-100 text-gray-700',
    under_review: 'bg-blue-100 text-blue-700',
    interview: 'bg-purple-100 text-purple-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">My Applications</h1>
        <p className="text-gray-500 mt-1">Track your opportunity applications</p>
      </div>

      <div className="space-y-3">
        {applications.map((app, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-navy-900">{app.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{app.company}</p>
                <p className="text-xs text-gray-400 mt-1">Applied: {app.date}</p>
              </div>
              <Badge className={statusVariant[app.status]}>
                {app.status.replace('_', ' ')}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
