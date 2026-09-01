import { Card } from '@/components/ui';
import { Users, Building, Shield, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '12,450', icon: Users, color: 'bg-blue-500' },
    { label: 'Organizations', value: '86', icon: Building, color: 'bg-green-500' },
    { label: 'Active Sessions', value: '1,230', icon: Activity, color: 'bg-purple-500' },
    { label: 'Security Events', value: '3', icon: Shield, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Platform Admin</h1>
        <p className="text-gray-500 mt-1">System overview and governance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-navy-900 mb-4">User Growth</h3>
          <div className="space-y-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
              <div key={month} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-8">{month}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: `${20 + i * 13}%` }} />
                </div>
                <span className="text-xs font-medium text-gray-700">{2000 + i * 1800}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-navy-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[{ action: 'New institution registered', time: '5 min ago' }, { action: 'Bulk assessment imported', time: '1 hour ago' }, { action: 'Security scan completed', time: '3 hours ago' }].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{item.action}</span>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
