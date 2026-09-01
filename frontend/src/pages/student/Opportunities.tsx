import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { MapPin, Clock, Percent } from 'lucide-react';

export default function Opportunities() {
  const opportunities = [
    { title: 'Backend Engineering Intern', company: 'TechCorp', type: 'Internship', match: 92, location: 'Remote', duration: '3 months' },
    { title: 'Full Stack Developer', company: 'StartupXYZ', type: 'Job', match: 85, location: 'Bangalore', duration: 'Full-time' },
    { title: 'Cloud Project Contributor', company: 'CloudBase', type: 'Project', match: 78, location: 'Remote', duration: '2 months' },
    { title: 'Data Engineering Trainee', company: 'DataFlow', type: 'Training', match: 72, location: 'Hybrid', duration: '6 months' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Matched Opportunities</h1>
        <p className="text-gray-500 mt-1">Ranked by your competency fit</p>
      </div>

      <div className="space-y-3">
        {opportunities.map((opp, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-navy-900">{opp.title}</h3>
                  <Badge variant="outline" size="sm">{opp.type}</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{opp.company}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{opp.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{opp.duration}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-600 font-bold">
                    <Percent className="w-4 h-4" />{opp.match}%
                  </div>
                  <span className="text-xs text-gray-500">match</span>
                </div>
                <Button size="sm">Apply</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
