import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';

export default function Expertise() {
  const expertise = [
    { area: 'Machine Learning', level: 'Expert', projects: 12 },
    { area: 'Natural Language Processing', level: 'Advanced', projects: 8 },
    { area: 'Computer Vision', level: 'Advanced', projects: 6 },
    { area: 'Data Engineering', level: 'Competent', projects: 4 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Expertise Graph</h1>
        <p className="text-gray-500 mt-1">Your areas of expertise</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {expertise.map((exp) => (
          <Card key={exp.area} className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-navy-900">{exp.area}</h3>
              <Badge>{exp.level}</Badge>
            </div>
            <p className="text-sm text-gray-500">{exp.projects} related projects</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
