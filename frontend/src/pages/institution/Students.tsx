import { Card } from '@/components/ui';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui';
import { Search } from 'lucide-react';

export default function Students() {
  const students = [
    { name: 'Alex Johnson', department: 'CSE', year: '3rd', skills: 12, readiness: 85 },
    { name: 'Maria Garcia', department: 'CSE', year: '4th', skills: 15, readiness: 92 },
    { name: 'David Kim', department: 'ECE', year: '3rd', skills: 8, readiness: 68 },
    { name: 'Sarah Williams', department: 'IT', year: '4th', skills: 14, readiness: 88 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Students</h1>
          <p className="text-gray-500 mt-1">Manage and monitor student progress</p>
        </div>
        <Button size="sm">Export Data</Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search students..." className="pl-10" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Department</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Year</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Skills</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Readiness</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 text-sm font-medium text-navy-900">{s.name}</td>
                  <td className="p-4 text-sm text-gray-600">{s.department}</td>
                  <td className="p-4 text-sm text-gray-600">{s.year}</td>
                  <td className="p-4 text-sm text-gray-600">{s.skills}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${s.readiness}%` }} />
                      </div>
                      <span className="text-xs text-gray-600">{s.readiness}%</span>
                    </div>
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
