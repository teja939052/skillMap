import { Card, Badge, Input } from '@/components/ui';
import { Search } from 'lucide-react';

export default function AuditLogs() {
  const logs = [
    { action: 'user.login', actor: 'alex@edu.in', resource: 'auth', time: '2 min ago', ip: '192.168.1.1' },
    { action: 'evidence.verify', actor: 'sarah@university.edu', resource: 'evidence', time: '15 min ago', ip: '10.0.0.5' },
    { action: 'organization.create', actor: 'admin@skillmap.in', resource: 'organizations', time: '1 hour ago', ip: '172.16.0.1' },
    { action: 'user.register', actor: 'newuser@edu.in', resource: 'users', time: '2 hours ago', ip: '192.168.2.10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Audit Logs</h1>
        <p className="text-gray-500 mt-1">Security and admin audit trail</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search logs..." className="pl-10" />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-sm font-medium text-gray-500">Action</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Actor</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Resource</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Time</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4"><Badge variant="outline" size="sm">{log.action}</Badge></td>
                  <td className="p-4 text-sm text-gray-600">{log.actor}</td>
                  <td className="p-4 text-sm text-gray-600">{log.resource}</td>
                  <td className="p-4 text-sm text-gray-500">{log.time}</td>
                  <td className="p-4 text-sm text-gray-500 font-mono">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
