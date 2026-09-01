import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { LinkIcon } from 'lucide-react';

export default function Curriculum() {
  const mappings = [
    { course: 'Data Structures & Algo', competencies: ['Problem Solving', 'Algorithms', 'Python'], coverage: 90 },
    { course: 'Web Development', competencies: ['React', 'JavaScript', 'HTML/CSS'], coverage: 85 },
    { course: 'Database Systems', competencies: ['SQL', 'Data Modeling', 'PostgreSQL'], coverage: 80 },
    { course: 'Cloud Computing', competencies: ['AWS', 'Docker', 'DevOps'], coverage: 60 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Curriculum Mapping</h1>
        <p className="text-gray-500 mt-1">Course to competency alignment</p>
      </div>
      <div className="space-y-3">
        {mappings.map((m) => (
          <Card key={m.course} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-gray-400" />
                <h3 className="font-semibold text-navy-900">{m.course}</h3>
              </div>
              <Badge variant={m.coverage >= 80 ? 'success' : 'warning'}>{m.coverage}% covered</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {m.competencies.map((c) => (
                <Badge key={c} variant="outline" size="sm">{c}</Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
