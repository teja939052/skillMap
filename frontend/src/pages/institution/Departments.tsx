import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';

export default function Departments() {
  const departments = [
    { name: 'Computer Science', students: 850, courses: 24, avgReadiness: 78 },
    { name: 'Electronics', students: 620, courses: 18, avgReadiness: 65 },
    { name: 'Information Technology', students: 480, courses: 16, avgReadiness: 72 },
    { name: 'Mechanical', students: 350, courses: 12, avgReadiness: 58 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Departments</h1>
        <p className="text-gray-500 mt-1">Department-wise overview</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept) => (
          <Card key={dept.name} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-navy-900">{dept.name}</h3>
              <Badge>{dept.students} students</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{dept.courses} courses</span>
              <span>Readiness: {dept.avgReadiness}%</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
