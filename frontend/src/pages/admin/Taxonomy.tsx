import { Card, Badge, Button, Input } from '@/components/ui';
import { Search, Plus } from 'lucide-react';

export default function Taxonomy() {
  const competencies = [
    { name: 'Python Programming', type: 'Skill', domain: 'Programming', children: 5 },
    { name: 'React.js', type: 'Technology', domain: 'Frontend', children: 3 },
    { name: 'Machine Learning', type: 'Skill', domain: 'AI/ML', children: 8 },
    { name: 'Docker', type: 'Tool', domain: 'DevOps', children: 2 },
    { name: 'SQL', type: 'Skill', domain: 'Database', children: 4 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Taxonomy Management</h1>
          <p className="text-gray-500 mt-1">Manage the competency catalog</p>
        </div>
        <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Competency</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search competencies..." className="pl-10" />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Domain</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Children</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {competencies.map((c) => (
                <tr key={c.name} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 text-sm font-medium text-navy-900">{c.name}</td>
                  <td className="p-4"><Badge variant="outline" size="sm">{c.type}</Badge></td>
                  <td className="p-4 text-sm text-gray-600">{c.domain}</td>
                  <td className="p-4 text-sm text-gray-600">{c.children}</td>
                  <td className="p-4">
                    <Button size="sm" variant="ghost">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
