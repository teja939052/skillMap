import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Search } from 'lucide-react';

export default function Users() {
  const users = [
    { name: 'Alex Johnson', email: 'alex@edu.in', role: 'student', status: 'active' },
    { name: 'Dr. Sarah Chen', email: 'sarah@university.edu', role: 'faculty', status: 'active' },
    { name: 'TechCorp HR', email: 'hr@techcorp.com', role: 'industry', status: 'active' },
    { name: 'Admin User', email: 'admin@skillmap.in', role: 'platform_admin', status: 'active' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">User Management</h1>
        <p className="text-gray-500 mt-1">Manage platform users</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search users..." className="pl-10" />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Role</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 text-sm font-medium text-navy-900">{u.name}</td>
                  <td className="p-4 text-sm text-gray-600">{u.email}</td>
                  <td className="p-4"><Badge variant="outline" size="sm">{u.role}</Badge></td>
                  <td className="p-4"><Badge variant="success" size="sm">{u.status}</Badge></td>
                  <td className="p-4"><Button size="sm" variant="ghost">Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
