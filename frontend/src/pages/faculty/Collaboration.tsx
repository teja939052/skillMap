import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Building, Users } from 'lucide-react';

export default function Collaboration() {
  const collabs = [
    { title: 'NLP for Healthcare', partner: 'MedTech Inc', status: 'active', type: 'Research' },
    { title: 'Smart City Analytics', partner: 'CityGov', status: 'active', type: 'Project' },
    { title: 'Fraud Detection System', partner: 'BankCorp', status: 'completed', type: 'Consultancy' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Collaboration</h1>
        <p className="text-gray-500 mt-1">Industry research and projects</p>
      </div>

      <div className="space-y-3">
        {collabs.map((c, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-navy-900">{c.title}</h3>
                  <Badge variant={c.status === 'active' ? 'success' : 'default'}>{c.status}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Building className="w-3 h-3" />{c.partner}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.type}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
