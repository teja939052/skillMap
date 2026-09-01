import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Building } from 'lucide-react';

export default function Partnerships() {
  const partners = [
    { name: 'IIT Delhi', type: 'institution', students: 450, activeOpps: 8 },
    { name: 'BITS Pilani', type: 'institution', students: 320, activeOpps: 5 },
    { name: 'NIT Trichy', type: 'institution', students: 280, activeOpps: 4 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Partnerships</h1>
        <p className="text-gray-500 mt-1">Your institution partnerships</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {partners.map((p) => (
          <Card key={p.name} className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-navy-100 p-2 rounded-lg">
                <Building className="w-5 h-5 text-navy-700" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">{p.name}</h3>
                <Badge variant="outline" size="sm">{p.type}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{p.students} students</span>
              <span>{p.activeOpps} active opps</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
